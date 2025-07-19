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
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const DocumentContext = createContext();

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

  // Load documents and folders when user changes
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setFolders([]);
      return;
    }

    setLoading(true);

    // Set up real-time listeners for documents
    const documentsQuery = query(
      collection(db, 'documents'),
      where('userId', '==', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribeDocuments = onSnapshot(documentsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
      setLoading(false);
    });

    // Set up real-time listeners for folders 
    const foldersQuery = query(
      collection(db, 'folders'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFolders = onSnapshot(foldersQuery, (snapshot) => {
      const folderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(folderList);
    });

    return () => {
      unsubscribeDocuments();
      unsubscribeFolders();
    };
  }, [user]);

  const createDocument = async (title = 'Untitled', folderId = null) => {
    if (!user) return null;

    try {
      const newDoc = {
        title,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '' }]
            }
          ]
        },
        folderId,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'documents'), newDoc);
      return { id: docRef.id, ...newDoc };
    } 
    catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  };

  const updateDocument = async (id, updates) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'documents', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } 
    catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  };

  const deleteDocument = async (id) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'documents', id));
    } 
    catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  };

  const createFolder = async (name) => {
    if (!user) return null;

    try {
      const newFolder = {
        name,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      const folderRef = await addDoc(collection(db, 'folders'), newFolder);
      return { id: folderRef.id, ...newFolder };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  };

  const deleteFolder = async (id) => {
    if (!user) return;

    try {
      // Delete the folder
      await deleteDoc(doc(db, 'folders', id));

      // Update documents in this folder to have no folder
      const docsInFolder = documents.filter(doc => doc.folderId === id);
      const updatePromises = docsInFolder.map(document => 
        updateDocument(document.id, { folderId: null })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Failed to delete folder');
    }
  };

  const value = {
    documents,
    folders,
    currentDocument,
    setCurrentDocument,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    createFolder,
    deleteFolder,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};