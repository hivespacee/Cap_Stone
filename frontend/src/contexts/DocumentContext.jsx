import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase'; 
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState({});
  const [documentComments, setDocumentComments] = useState({});
  
  //load user documents
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setFolders([]);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    setLoading(true);

    const documentsQuery = query(
      collection(db, 'docs'), where('members', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

      const unsubscribeDocuments = onSnapshot(documentsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error for documents:", error);
      setLoading(false);
    });

    const foldersQuery = query(
      collection(db, 'folders'), where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
      const folderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(folderList);
    }, (error) => {
        console.error("Firestore onSnapshot error for folders:", error);
    });

    return () => {
      unsubscribeDocuments(); 
      unsubscribeFolders(); 
      if (socket) {
        socket.disconnect();
        setSocket(null)
      }
    };
  }, [user]);

  //initialize socket connection
  useEffect(() => {
    if (user?.id && !socket) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const newSocket = io(apiBaseUrl, {
        auth: {
          userId: user.id,
          userName: user.name
        }
      });

      newSocket.on('connect', () => {
        newSocket.emit('authenticate', {
          userId: user.id,
          userName: user.name
        });
      });

      newSocket.on('activeUsers', (users) => {
        setActiveUsers(users);
      });

      newSocket.on('documentUpdate', (data) => {
        console.log('Real-time document content updated via socket:', data);
      });

      newSocket.on('commentAdded', (commentData) => {
        console.log('New comment added via socket:', commentData);

        setDocumentComments(prevComments => ({
          ...prevComments,
          [commentData.documentId]: [...(prevComments[commentData.documentId] || []), commentData.comment]
        }));
      });

      setSocket(newSocket);
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
    if (!user?.id && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user?.id]);

  const createDocument = async (title = 'Untitled', folderId = null) => {
    if (!user) {
      console.error('User not authenticated to create document.');
      return null;
    }

    try {
      const newDoc = {
        title,
        content: [
          {
            type: 'paragraph',
            children: [{ text: 'Start writing...' }]
          }
        ],
        folderId,
        roles: {
          [user.id]: 'admin' 
        },
        members: [user.id], 
        createdBy: user.id,
        createdByName: user.name || user.email || 'Unknown User',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEditedBy: user.id,
        lastEditedByName: user.name || user.email || 'Unknown User',
        activeUsers: [], 
        comments: [] 
      };

      const docRef = await addDoc(collection(db, 'docs'), newDoc);
      console.log('Document created with ID:', docRef.id);
      return { id: docRef.id, ...newDoc };
    }
    catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  };

  const updateDocument = async (id, updates) => {
    if (!user) {
      console.error('User not authenticated to update document.');
      return;
    }

    try {
      const docRef = doc(db, 'docs', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.id,
        lastEditedByName: user.name || user.email || 'Unknown User',

      });

      if (socket) {
        socket.emit('documentChange', {
          documentId: id,
          userId: user.id,
          userName: user.name,
          changes: updates 
        });
      }
      console.log('Document updated successfully:', id);
    }
    catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  };

  const deleteDocument = async (id) => {
    if (!user) {
      console.error('User not authenticated to delete document.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'docs', id));
      console.log('Document deleted successfully:', id);
    }
    catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  };

  const createFolder = async (name) => {
    if (!user) {
      console.error('User not authenticated to create folder.');
      return null;
    }

    try {
      const newFolder = {
        name,
        userId: user.id,
        createdAt: serverTimestamp(),
      };

      const folderRef = await addDoc(collection(db, 'folders'), newFolder);
      console.log('Folder created with ID:', folderRef.id);
      return { id: folderRef.id, ...newFolder };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  };

  const shareDocument = async (documentId, email, role) => {
    if (!user) {
      console.error('User not authenticated to share document.');
      return; 
    }

    try {
      const docRef = doc(db, 'docs', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const docData = docSnap.data();
      const currentUserRole = docData.roles?.[user.id];

      if (currentUserRole !== 'admin') {
        throw new Error('Only admins can share documents.');
      }

      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(`User with email "${email}" not found. Please ensure they have registered.`);
      }

      const targetUserDoc = querySnapshot.docs[0];
      const targetUid = targetUserDoc.id; 
      const targetUserName = targetUserDoc.data().name || targetUserDoc.data().email?.split('@')[0] || 'Unknown User';
      

      const newRoles = { ...docData.roles, [targetUid]: role };
      const newMembers = Object.keys(newRoles);

      await updateDoc(docRef, {
        roles: newRoles,
        members: newMembers,
        updatedAt: serverTimestamp(),
        lastEditedBy: user.id,
        lastEditedByName: user.name || user.email || 'Unknown User',
      });
      return true;
    } 
    catch (error) {
      console.error('Error sharing document:', error);
      throw new Error(`Failed to share document: ${error.message}`);
    }
  };

  const joinDocument = (documentId) => {
    if (socket && user) {
      socket.emit('joinDocument', {
        documentId,
        userId: user.id,
        userName: user.name,
        userRole: getUserRole(documents.find(d => d.id === documentId)) // Pass current user's role
      });
      console.log(`User ${user.name} joined document ${documentId}`);
    }
  };

  const leaveDocument = (documentId) => {
    if (socket && user) {
      socket.emit('leaveDocument', {
        documentId,
        userId: user.id
      });
      console.log(`User ${user.name} left document ${documentId}`);
    }
  };

  const addComment = async (documentId, content, blockId = null) => {
    if (!user) {
      console.error('User not authenticated to add comment.');
      return;
    }

    try {
      const comment = {
        id: uuidv4(), 
        content,
        blockId, 
        userId: user.id,
        userName: user.name || user.email || 'Unknown User',
        createdAt: new Date().toISOString(),
        resolved: false
      };

      const docRef = doc(db, 'docs', documentId);
      await updateDoc(docRef, {
        comments: arrayUnion(comment),
        updatedAt: serverTimestamp()
      });

      if (socket) {
        socket.emit('addComment', {
          documentId,
          comment
        });
      }
      console.log(`Comment added to document ${documentId}`);
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  };

  const getUserRole = (document, userId = user?.id) => {
    if (!document || !userId) return null;
    return document.roles?.[userId] || null;
  };

  const value = {
    documents,
    folders,
    currentDocument,
    setCurrentDocument,
    loading,
    activeUsers,
    documentComments,
    createDocument,
    updateDocument,
    deleteDocument,
    createFolder,
    shareDocument,
    joinDocument,
    leaveDocument,
    addComment,
    getUserRole,
    socket
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};