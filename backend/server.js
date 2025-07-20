// SERVER/Socket.IO PART
import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const allowedOrigin = 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const activeUsers = new Map();
const userSessions = new Map();
const documentCursors = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (userData) => {
    if (!userData || !userData.userId || !userData.userName) {
      console.warn(`Authentication failed for socket ${socket.id}: Missing user data.`);
      socket.disconnect(true);
      return;
    }
    userSessions.set(socket.id, {
      userId: userData.userId,
      userName: userData.userName,
      socketId: socket.id,
      currentDocument: null
    });
    console.log(`User authenticated: ${userData.userName} (ID: ${userData.userId})`);
  });

  socket.on('joinDocument', (data) => {
    const { documentId } = data;
    const userSession = userSessions.get(socket.id);

    if (!userSession || !userSession.userId || !userSession.userName) {
      socket.emit('authError', { message: 'Please authenticate first.' });
      return;
    }

    const { userId, userName } = userSession;

    // Leave previous document if switching
    if (userSession.currentDocument && userSession.currentDocument !== documentId) {
      socket.leave(userSession.currentDocument);
      removeUserFromDocument(userSession.currentDocument, socket.id);
      broadcastActiveUsers(userSession.currentDocument);
    }

    socket.join(documentId);

    userSession.currentDocument = documentId;
    userSessions.set(socket.id, userSession);

    if (!activeUsers.has(documentId)) activeUsers.set(documentId, new Set());
    activeUsers.get(documentId).add(socket.id);

    if (!documentCursors.has(documentId)) documentCursors.set(documentId, new Map());

    broadcastActiveUsers(documentId);

    // --- SEND INITIAL CURSOR STATES TO JOINER ---
    const docCursors = documentCursors.get(documentId);
    if (docCursors && docCursors.size > 0) {
      socket.emit('cursorPositions', {
        documentId,
        cursors: Array.from(docCursors.values()).filter(c => c.userId !== userId)
      });
    }

    console.log(`User ${userName} (${userId}) joined document ${documentId}`);
  });

  socket.on('leaveDocument', (data) => {
    const { documentId } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      socket.leave(documentId);
      removeUserFromDocument(documentId, socket.id); // Now also removes cursor + broadcasts update
      userSession.currentDocument = null;
      userSessions.set(socket.id, userSession);
      broadcastActiveUsers(documentId);
      console.log(`User ${userSession.userName} (${userSession.userId}) has left document ${documentId}`);
    }
  });

  socket.on('cursorUpdate', (data) => {
    const { documentId, position, selection } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      const docCursors = documentCursors.get(documentId);
      if (docCursors) {
        docCursors.set(userSession.userId, {
          userId: userSession.userId,
          userName: userSession.userName,
          position,
          selection,
          timestamp: Date.now()
        });

        // Broadcast to others
        socket.to(documentId).emit('cursorPositions', {
          documentId,
          cursors: Array.from(docCursors.values()).filter(c => c.userId !== userSession.userId)
        });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userSession = userSessions.get(socket.id);
    if (userSession) {
      if (userSession.currentDocument) {
        removeUserFromDocument(userSession.currentDocument, socket.id);
        broadcastActiveUsers(userSession.currentDocument);
      }
      userSessions.delete(socket.id);
    }
  });
});

// Remove user from document + immediately remove cursor + broadcast update
function removeUserFromDocument(documentId, socketId) {
  const docUsers = activeUsers.get(documentId);
  const session = userSessions.get(socketId);
  const userId = session?.userId;

  if (docUsers) {
    docUsers.delete(socketId);
    if (docUsers.size === 0) {
      activeUsers.delete(documentId);
    }
  }

  // Remove cursor immediately if possible
  if (userId && documentCursors.has(documentId)) {
    const cursors = documentCursors.get(documentId);
    cursors.delete(userId);

    // Broadcast updated cursor positions to all in doc
    io.to(documentId).emit('cursorPositions', {
      documentId,
      cursors: Array.from(cursors.values())
    });

    // If no cursors left, optional cleanup
    if (cursors.size === 0) documentCursors.delete(documentId);
  }
}

// Broadcast active user list for a document
function broadcastActiveUsers(documentId) {
  const docUsers = activeUsers.get(documentId);
  if (docUsers) {
    const userList = Array.from(docUsers).map(socketId => {
      const session = userSessions.get(socketId);
      return session ? {
        userId: session.userId,
        userName: session.userName,
        socketId: session.socketId
      } : null;
    }).filter(Boolean);
    io.to(documentId).emit('activeUsers', userList);
  } else {
    io.to(documentId).emit('activeUsers', []);
  }
}

// Periodically clean up stale cursors
setInterval(() => {
  const now = Date.now();
  const CURSOR_TIMEOUT = 30000;
  documentCursors.forEach((cursors, documentId) => {
    let changed = false;
    cursors.forEach((cursor, userId) => {
      if (now - cursor.timestamp > CURSOR_TIMEOUT) {
        cursors.delete(userId);
        changed = true;
      }
    });
    if (changed) {
      io.to(documentId).emit('cursorPositions', {
        documentId,
        cursors: Array.from(cursors.values())
      });
    }
  });
}, 10000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});
