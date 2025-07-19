import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FileText, Search, Clock } from 'lucide-react';

const Dashboard = () => {
  const { documents, folders, createDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentDoc, setRecentDoc] = useState(null);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  useEffect(() => {
    // Get last opened document ID from localStorage
    const lastDocId = localStorage.getItem('lastOpenedDocumentId');
    if (lastDocId) {
      const doc = documents.find(d => d.id === lastDocId);
      setRecentDoc(doc || null);
    } else {
      setRecentDoc(null);
    }
  }, [documents]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? doc.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const recentDocuments = documents.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return dateB - dateA;
    })
    .slice(0, 5);

  const handleCreateDocument = () => {
    setShowNewDocModal(true);
  };

  const handleConfirmCreateDocument = async () => {
    if (newDocName.trim()) {
      await createDocument(newDocName.trim(), selectedFolder);
      setNewDocName('');
      setShowNewDocModal(false);
    }
  };

  const handleFullScreen = () => {
    setIsSidebarOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'some time ago';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-screen bg-cream-light dark:bg-slate-dark *:border-none">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onFullScreen={handleFullScreen} />
      <div className="flex-1 flex flex-col overflow-hidden ">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleFullScreen}
                className="btn-secondary flex items-center gap-2"
                title="Full Screen"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M20 4v6M20 4h-6M4 20v-6M4 20h6"/>
                </svg>
              </button>
            </div>
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Ready to create something amazing today?
              </p>
            </div>
            <div className="mb-8">
              {recentDoc ? (
                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Continue where you left off
                  </h2>
                  <h3 className="font-medium text-slate-dark dark:text-white text-lg">
                    {recentDoc.title}
                  </h3>
                  <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                    {/* Show a preview of the document content if available */}
                    {recentDoc.content?.content?.[0]?.content?.[0]?.text || 'No preview available.'}
                  </div>
                  <Link
                    to={`/document/${recentDoc.id}`}
                    className="btn-primary w-fit mt-2"
                  >
                    Continue Editing
                  </Link>
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">No recent document</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Open a document from the sidebar or create a new one to get started.</p>
                  <button onClick={handleCreateDocument} className="btn-primary">
                    Create Document
                  </button>
                </div>
              )}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Documents */}
              {/* <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Documents
                </h2>
                <div className="space-y-3">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map(doc => (
                      <Link
                        key={doc.id}
                        to={`/document/${doc.id}`}
                        className="card p-4 hover:shadow-lg transition-all duration-300 group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-light rounded-lg flex items-center justify-center text-white">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-slate transition-colors">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Updated {formatDate(doc.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="card p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">No documents yet</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first document to get started</p>
                      <button onClick={handleCreateDocument} className="btn-primary">
                        Create Document
                      </button>
                    </div>
                  )}
                </div>
              </div> */}

              {/* All Documents */}
              {/* <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  All Documents
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredDocuments.map(doc => (
                    <Link
                      key={doc.id}
                      to={`/document/${doc.id}`}
                      className="block p-3 rounded-lg hover:bg-cream-light dark:hover:bg-charcoal-light transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(doc.updatedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </main>
      </div>
      {/* --- Modal for new document name --- */}
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
              onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreateDocument()}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewDocModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleConfirmCreateDocument} className="btn-primary" disabled={!newDocName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
