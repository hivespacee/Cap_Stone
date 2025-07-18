import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import { 
  Edit3, 
  Home, 
  FileText, 
  FolderPlus, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Settings,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { documents, folders, createDocument, createFolder } = useDocuments();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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
    createDocument('Untitled Document', folderId);
  };

  const documentsWithoutFolder = documents.filter(doc => !doc.folderId);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-1000 ${isOpen ? 'w-70' : 'w-20'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {isOpen && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Chotaa Notion </span>
          </Link>
        )}
         <button onClick={() => setIsOpen(!isOpen)} className="pl-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {isOpen ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Main Navigation */}
        <Link
          to="/dashboard"
          className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          title="Dashboard"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="truncate">Dashboard</span>}
        </Link>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
             {isOpen && (
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Documents
                </span>
            )}
            <div className={`flex items-center gap-1 ${!isOpen && 'w-full justify-center'}`}>
              <button
                onClick={() => handleCreateDocument()}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="New Document"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="New Folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Documents without folder */}
          {documentsWithoutFolder.map(doc => (
            <Link
              key={doc.id}
              to={`/document/${doc.id}`}
              className={`sidebar-item ${location.pathname === `/document/${doc.id}` ? 'active' : ''}`}
              title={doc.title}
              onClick={() => localStorage.setItem('lastOpenedDocumentId', doc.id)}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate">{doc.title}</span>}
            </Link>
          ))}

          {/* Folders */}
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
                        <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Folder documents */}
                {isExpanded && folderDocs.map(doc => (
                  <Link
                    key={doc.id}
                    to={`/document/${doc.id}`}
                    className={`sidebar-item ${location.pathname === `/document/${doc.id}` ? 'active' : ''} ${isOpen ? 'ml-6' : 'justify-center'}`}
                    title={doc.title}
                    onClick={() => localStorage.setItem('lastOpenedDocumentId', doc.id)}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    {isOpen && <span className="truncate">{doc.title}</span>}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="sidebar-item w-full" title="Settings">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="truncate">Settings</span>}
        </button>
      </div>

      {/* New Folder Modal */}
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
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="btn-primary"
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
