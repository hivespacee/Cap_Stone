import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Save, ArrowLeft, Edit3 } from 'lucide-react';

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument } = useDocuments();
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content?.content?.[0]?.content?.[0]?.text || '');
    } else {
      navigate('/dashboard');
    }
  }, [id, documents, navigate]);

  const handleSave = () => {
    if (document) {
      updateDocument(document.id, {
        title,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: content }]
            }
          ]
        }
      });
      setLastSaved(new Date());
      setIsEditing(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsEditing(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsEditing(true);
  };

  if (!document) {
    return (
      <div className="flex h-screen bg-cream dark:bg-charcoal">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document not found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream dark:bg-charcoal">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  placeholder="Untitled"
                />
              </div>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto p-8">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing..."
                className="w-full min-h-96 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white text-lg leading-relaxed placeholder-gray-500"
                style={{ minHeight: 'calc(100vh - 200px)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;