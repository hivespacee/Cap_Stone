// backend_here/server.js

// Import necessary modules
import express, { json } from 'express'; // Use ES module syntax for express and json
import { createServer } from 'http';
import { Server } from 'socket.io'; // Use named import for Server
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid'; // Imported but not used, can be removed if not needed

// Firebase Admin SDK (optional - add your credentials)
// This section is commented out, but if you need to perform server-side
// operations like looking up user UIDs by email for sharing, you would
// uncomment and configure this.
// import admin from 'firebase-admin'; // Use ES module syntax for admin
// import serviceAccount from './firebase-service-account.json'; // Adjust path as needed

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://your-project-id.firebaseio.com"
// });
// const db = admin.firestore(); // If you need Firestore in backend
// const auth = admin.auth();   // If you need Auth in backend

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO and Express
// IMPORTANT: Replace 'http://localhost:5173' with the actual origin of your frontend application
// In a production environment, this should be your deployed frontend URL.
const allowedOrigin = 'http://localhost:5173'; // Your React app's Vite development server URL

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST']
}));
app.use(json()); // For parsing JSON request bodies in Express routes

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true // Allow cookies to be sent (if your auth system uses them)
  }
});

// Store active users and document sessions
// activeUsers: Maps documentId to a Set of socketIds currently in that document.
const activeUsers = new Map();
// userSessions: Maps socketId to comprehensive user session info (userId, userName, currentDocument).
const userSessions = new Map();
// documentCursors: Maps documentId to a Map of userId to their cursor/selection data.
const documentCursors = new Map();

// Health check endpoint for basic server status monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication after initial connection
  // This is a good pattern to receive user details securely after the handshake.
  socket.on('authenticate', (userData) => {
    if (!userData || !userData.userId || !userData.userName) {
      console.warn(`Authentication failed for socket ${socket.id}: Missing user data.`);
      socket.disconnect(true); // Disconnect unauthenticated user
      return;
    }
    userSessions.set(socket.id, {
      userId: userData.userId,
      userName: userData.userName,
      socketId: socket.id,
      currentDocument: null // Initialize current document as null
    });
    console.log(`User authenticated: ${userData.userName} (ID: ${userData.userId})`);
  });

  // Handle joining a document
  socket.on('joinDocument', (data) => {
    const { documentId } = data; // Only need documentId from client
    const userSession = userSessions.get(socket.id);

    // Ensure the user is authenticated before allowing them to join a document
    if (!userSession || !userSession.userId || !userSession.userName) {
      console.warn(`Attempted to join document ${documentId} without proper authentication for socket ${socket.id}.`);
      socket.emit('authError', { message: 'Please authenticate first.' }); // Inform client
      return;
    }

    const { userId, userName } = userSession; // Get user info from authenticated session

    // Leave any previous document rooms if the user is switching documents
    if (userSession.currentDocument && userSession.currentDocument !== documentId) {
      console.log(`User ${userName} leaving previous document ${userSession.currentDocument}`);
      socket.leave(userSession.currentDocument);
      removeUserFromDocument(userSession.currentDocument, socket.id);
      broadcastActiveUsers(userSession.currentDocument); // Broadcast update for the document they left
    }

    // Join the new document room
    socket.join(documentId);

    // Update user session with the current document they are in
    userSession.currentDocument = documentId;
    userSessions.set(socket.id, userSession); // Update the map with the modified session

    // Add user to the document's active users set
    if (!activeUsers.has(documentId)) {
      activeUsers.set(documentId, new Set());
    }
    activeUsers.get(documentId).add(socket.id);

    // Initialize cursor tracking for this document if not already present
    if (!documentCursors.has(documentId)) {
      documentCursors.set(documentId, new Map());
    }

    // Broadcast updated active users list to all users in the current document's room
    broadcastActiveUsers(documentId);

    console.log(`User ${userName} (${userId}) joined document ${documentId}`);
  });

  // Handle leaving a document explicitly
  socket.on('leaveDocument', (data) => {
    const { documentId } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      socket.leave(documentId);
      removeUserFromDocument(documentId, socket.id);
      userSession.currentDocument = null; // Clear current document from session
      userSessions.set(socket.id, userSession); // Update the map
      broadcastActiveUsers(documentId);
      console.log(`User ${userSession.userName} (${userSession.userId}) explicitly left document ${documentId}`);
    } else {
      console.warn(`User ${socket.id} tried to leave document ${documentId} but was not in it or not authenticated.`);
    }
  });

  // Handle document content changes
  socket.on('documentChange', (data) => {
    const { documentId, changes } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      // Broadcast changes to all other users in the same document room
      socket.to(documentId).emit('documentUpdate', {
        documentId,
        userId: userSession.userId,
        userName: userSession.userName,
        changes,
        timestamp: new Date().toISOString()
      });
    } 
    else {
      console.warn(`Unauthorized documentChange from socket ${socket.id} for document ${documentId}`);
    }
  });

  // Handle cursor position updates
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
          timestamp: Date.now() // Timestamp for inactivity cleanup
        });

        // Broadcast cursor positions to all other users in the document
        // Filter out the sender's cursor from the broadcast list
        socket.to(documentId).emit('cursorPositions', {
          documentId, // Include documentId for client-side context
          cursors: Array.from(docCursors.values()).filter(
            cursor => cursor.userId !== userSession.userId
          )
        });
      }
    }
  });

  // Handle comments being added
  socket.on('addComment', (data) => {
    const { documentId, comment } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      // Enrich the comment with server-side user info for consistency
      const enrichedComment = {
        ...comment,
        userId: userSession.userId,
        userName: userSession.userName,
        timestamp: new Date().toISOString()
      };
      // Broadcast new comment to all users in the document (including sender for immediate feedback)
      io.to(documentId).emit('newComment', {
        documentId,
        comment: enrichedComment
      });
      console.log(`New comment added to document ${documentId} by ${userSession.userName}`);
    } else {
      console.warn(`Unauthorized addComment from socket ${socket.id} for document ${documentId}`);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { documentId, isTyping } = data;
    const userSession = userSessions.get(socket.id);

    if (userSession && userSession.currentDocument === documentId) {
      // Broadcast typing status to all other users in the document
      socket.to(documentId).emit('userTyping', {
        documentId, // Include documentId for client-side context
        userId: userSession.userId,
        userName: userSession.userName,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const userSession = userSessions.get(socket.id);
    if (userSession) {
      if (userSession.currentDocument) {
        // Remove user from the document they were in
        removeUserFromDocument(userSession.currentDocument, socket.id);
        broadcastActiveUsers(userSession.currentDocument); // Broadcast update for that document
      }
      userSessions.delete(socket.id); // Remove the user's session
    }
  });
});

// Helper function to remove a user's socket from a document's active users
function removeUserFromDocument(documentId, socketId) {
  const docUsers = activeUsers.get(documentId);
  if (docUsers) {
    docUsers.delete(socketId);
    if (docUsers.size === 0) {
      activeUsers.delete(documentId); // Remove document entry if no active users left
      documentCursors.delete(documentId); // Also clear cursors for an empty document
      console.log(`Document ${documentId} is now empty of active users.`);
    }
  }
}

// Helper function to broadcast the list of active users for a specific document
function broadcastActiveUsers(documentId) {
  const docUsers = activeUsers.get(documentId);
  if (docUsers) {
    // Map socketIds to user info from userSessions
    const userList = Array.from(docUsers).map(socketId => {
      const session = userSessions.get(socketId);
      return session ? {
        userId: session.userId,
        userName: session.userName,
        socketId: session.socketId
        // You might want to include userRole here if it's passed during authentication
      } : null;
    }).filter(Boolean); // Filter out any null entries (shouldn't happen if userSessions is consistent)

    io.to(documentId).emit('activeUsers', userList);
    // console.log(`Active users for document ${documentId}:`, userList.map(u => u.userName)); // Too verbose
  } else {
    // If no active users for this document, ensure the room is cleared on clients
    io.to(documentId).emit('activeUsers', []);
  }
}

// Periodically clean up stale cursor positions
setInterval(() => {
  const now = Date.now();
  const CURSOR_TIMEOUT = 30000; // 30 seconds of inactivity to remove cursor

  documentCursors.forEach((cursors, documentId) => {
    let changed = false;
    cursors.forEach((cursor, userId) => {
      if (now - cursor.timestamp > CURSOR_TIMEOUT) {
        cursors.delete(userId);
        changed = true;
      }
    });
    // If cursors changed for a document, broadcast the updated list
    if (changed && cursors.size > 0) {
      io.to(documentId).emit('cursorPositions', {
        documentId,
        cursors: Array.from(cursors.values())
      });
    } else if (changed && cursors.size === 0) {
      // If all cursors for a document are removed, send an empty list
      io.to(documentId).emit('cursorPositions', { documentId, cursors: [] });
    }
  });
}, 10000); // Check every 10 seconds

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});
