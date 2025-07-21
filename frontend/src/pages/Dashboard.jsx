import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users } from 'lucide-react';
import img1 from '../images/noseyGreeting.gif';
import img2 from '../images/noseySearching.gif';
import img3 from '../images/noseyThinking.gif';
import img4 from '../images/noseyWriting.gif';

const images = [img1, img2, img3,img4];

const Dashboard = () => {
  const { documents, folders, createDocument, activeUsers } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentDoc, setRecentDoc] = useState(null);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  useEffect(() => {
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
    <div className="flex h-screen bg-cream-light dark:bg-slate-dark *:border-none animate-fade-in transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onFullScreen={handleFullScreen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 animate-slide-up transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-auto p-6 min-h-0 flex flex-col">
          <div className="max-w-6xl mx-auto h-full flex flex-col min-h-0 flex-1">
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Let's go create something amazing today !
              </p>
            </div>
            <div className="mb-8 flex-1">
              {recentDoc ? (
                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Continue where you left off
                  </h2>
                  <h3 className="font-medium text-slate-dark dark:text-white text-lg">
                    File : {recentDoc.title}
                  </h3>
                  {activeUsers[recentDoc.id] && activeUsers[recentDoc.id].length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{activeUsers[recentDoc.id].length} user(s) active</span>
                    </div>
                  )}

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
              
              <div className="w-full flex justify-center items-end mt-8">
                <div className="flex flex-row gap-4">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`dashboard-img-${idx}`}
                      className="h-24 w-auto m-3 object-contain rounded-full shadow"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* New Document */}
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
    </div>
  );
};

export default Dashboard;
