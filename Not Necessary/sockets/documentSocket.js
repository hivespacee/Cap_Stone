// export default function registerDocumentSocket(io) {
//   const activeUsers = new Map();
//   const userSessions = new Map();
//   const documentCursors = new Map();

//   io.on('connection', (socket) => {
//     socket.on('joinDocument', (data) => {
//       // ...join logic...
//     });
//     socket.on('leaveDocument', (data) => {
//       // ...leave logic...
//     });
//     socket.on('documentChange', (data) => {
//       // ...broadcast changes...
//     });
//     socket.on('cursorUpdate', (data) => {
//       const { documentId, position, selection } = data;
//       const userSession = userSessions.get(socket.id);
//       if (userSession && userSession.currentDocument === documentId) {
//         const docCursors = documentCursors.get(documentId) || new Map();
//         docCursors.set(userSession.userId, {
//           userId: userSession.userId,
//           userName: userSession.userName,
//           position,
//           selection,
//           timestamp: Date.now()
//         });
//         documentCursors.set(documentId, docCursors);
//         // Broadcast to others
//         socket.to(documentId).emit('cursorPositions', {
//           documentId,
//           cursors: Array.from(docCursors.values()).filter(
//             cursor => cursor.userId !== userSession.userId
//           )
//         });
//       }
//     });
//     socket.on('addComment', (data) => {
//       // ...broadcast comments...
//     });
//     socket.on('disconnect', () => {
//       // ...cleanup...
//     });
//   });
// }
