import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import ShareDocumentModal from './ShareDocumentModal';
import {
  FileText,
  FolderPlus,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Share2,
  Crown,
  Highlighter,
  Eye
} from 'lucide-react';

const DocumentList = ({ isOpen }) => {
  const location = useLocation();
  const { documents, folders, createDocument, 
    createFolder, deleteDocument, getUserRole } = useDocuments();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFolderId, setNewDocFolderId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [shareModalDoc, setShareModalDoc] = useState(null);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleCreateDocument = (folderId = null) => {
    setNewDocFolderId(folderId);
    setShowNewDocModal(true);
  };

  const handleConfirmCreateDocument = async () => {
    if (newDocName.trim()) {
      await createDocument(newDocName.trim(), newDocFolderId);
      setNewDocName('');
      setNewDocFolderId(null);
      setShowNewDocModal(false);
    }
  };

  const handleDeleteDocument = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      await deleteDocument(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleShareDocument = (doc, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShareModalDoc(doc);
  };

  const getRoleIcon = (document) => {
    const role = getUserRole(document);
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" title="Owner" />;
      case 'editor':
        return <Highlighter className="w-3 h-3 text-blue-500" title="Editor" />;
      case 'viewer':
        return <Eye className="w-3 h-3 text-gray-500" title="Viewer" />;
      default:
        return null;
    }
  };

  const documentsWithoutFolder = documents.filter(doc => !doc.folderId);


  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            {isOpen && (
              <span className="text-s font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Documents
              </span>
            )}
            <div className={`flex items-center gap-1 ${!isOpen && 'w-full justify-center'}`}>
              <button
                onClick={() => handleCreateDocument()}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="New Document"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-5" />
              </button>
            </div>
          </div>

          {documentsWithoutFolder.map(doc => (
            <div key={doc.id} className="flex items-center group">
              <Link
                to={`/document/${doc.id}`}
                className={`sidebar-item flex-1 ${location.pathname === `/document/${doc.id}` ? 'active' : ''}`}
                title={doc.title}
                onClick={() => localStorage.setItem('lastOpenedDocumentId', doc.id)}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {isOpen && <span className="truncate">{doc.title}</span>}
                {isOpen && getRoleIcon(doc)}
              </Link>
              {isOpen && (
                <div className="flex items-center opacity-0 group-hover:opacity-100">
                  {getUserRole(doc) === 'admin' && (
                    <button
                      onClick={(e) => handleShareDocument(doc, e)}
                      className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                      title="Share Document"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  {getUserRole(doc) === 'admin' && (
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {folders.map(folder => {
            const folderDocs = documents.filter(doc => doc.folderId === folder.id);
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <div key={folder.id}>
                <div className="flex items-center group">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-cream-light dark:hover:bg-charcoal-light transition-colors"
                    title={folder.name}
                  >
                    {folderDocs.length > 0 ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )
                    ) : (
                      <div className="w-4 h-4 flex-shrink-0" />
                    )}
                    {isOpen && <span className="truncate">{folder.name}</span>}
                  </button>
                  {isOpen && (
                    <button
                      onClick={() => handleCreateDocument(folder.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Add Document"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isExpanded && folderDocs.map(doc => (
                  <div key={doc.id} className="flex items-center group">
                    <Link
                      to={`/document/${doc.id}`}
                      className={`sidebar-item flex-1 ${location.pathname === `/document/${doc.id}` ? 'active' : ''} ${isOpen ? 'ml-6' : 'justify-center'}`}
                      title={doc.title}
                      onClick={() => localStorage.setItem('lastOpenedDocumentId', doc.id)}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      {isOpen && <span className="truncate">{doc.title}</span>}
                      {isOpen && getRoleIcon(doc)}
                    </Link>
                    {isOpen && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100">
                        {getUserRole(doc) === 'admin' && (
                          <button
                            onClick={(e) => handleShareDocument(doc, e)}
                            className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                            title="Share Document"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}
                        {getUserRole(doc) === 'admin' && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Modals --- */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="input-field mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewFolderModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreateFolder} className="btn-primary" disabled={!newFolderName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showNewDocModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Name your new document</h3>
             <input
               type="text"
               value={newDocName}
               onChange={(e) => setNewDocName(e.target.value)}
               placeholder="Document name"
               className="input-field mb-4"
               autoFocus
             />
             <div className="flex gap-3 justify-end">
               <button onClick={() => setShowNewDocModal(false)} className="btn-secondary">Cancel</button>
               <button onClick={handleConfirmCreateDocument} className="btn-primary" disabled={!newDocName.trim()}>Create</button>
             </div>
           </div>
         </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelDelete} className="btn-secondary">Cancel</button>
              <button onClick={confirmDelete} className="btn-primary">Delete</button>
            </div>
          </div>
        </div>
      )}

      <ShareDocumentModal
        isOpen={!!shareModalDoc}
        onClose={() => setShareModalDoc(null)}
        document={shareModalDoc}
      />
    </>
  );
};

export default DocumentList;