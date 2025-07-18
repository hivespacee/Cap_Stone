import { useState } from 'react';
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder ? doc.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const recentDocuments = documents
    .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return dateB - dateA;
    })
    .slice(0, 5);

  const handleCreateDocument = () => {
    createDocument('Untitled Document', selectedFolder);
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
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden ">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">

            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Ready to create something amazing today?
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Documents */}
              <div className="lg:col-span-2">
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
              </div>

              {/* All Documents */}
              <div>
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
