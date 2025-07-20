import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../contexts/DocumentContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CommentsPanel from '../components/CommentsPanel';
import ActiveUsersIndicator from '../components/ActiveUsersIndicator';
import { Save, ArrowLeft, Edit3, Users, MessageSquare, Share2 } from 'lucide-react'; // Added Share2 icon

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument, joinDocument, leaveDocument, activeUsers, getUserRole, shareDocument } = useDocuments();
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('viewer');
  const [shareMessage, setShareMessage] = useState('');

  // Pass only initial content
  const [initialContent, setInitialContent] = useState(null);

  useEffect(() => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setDocument(doc);
      setTitle(doc.title);
      // Ensure initialContent is set only once or when doc.content truly changes
      // This prevents BlockNote from re-initializing unnecessarily.
      if (JSON.stringify(initialContent) !== JSON.stringify(doc.content)) {
        setInitialContent(doc.content || null);
      }
      setUserRole(getUserRole(doc));

      // Join document for real-time collaboration
      joinDocument(doc.id);
    } else {
      // If document is not found, navigate to dashboard after a short delay
      // to allow for potential real-time updates to fetch it.
      const timeoutId = setTimeout(() => {
        if (!documents.find((d) => d.id === id)) {
          navigate('/dashboard');
        }
      }, 1000); // Wait 1 second before redirecting

      return () => clearTimeout(timeoutId);
    }

    // Cleanup: leave document when component unmounts
    return () => {
      if (doc) {
        leaveDocument(doc.id);
      }
    };
  }, [id, documents, navigate, joinDocument, leaveDocument, getUserRole, initialContent]);

  // Initialize BlockNote editor only when initialContent is available
  // Do NOT pass `editable` or other deprecated options directly to useCreateBlockNote
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined, // Pass undefined if null to use default empty editor
  });

  // Effect to update editor content when document content changes from other sources (e.g., real-time updates)
  useEffect(() => {
    if (editor && document && initialContent && JSON.stringify(editor.document) !== JSON.stringify(initialContent)) {
      // Only update if the content from the document is different from the editor's current content
      editor.replaceBlocks(editor.document, initialContent);
    }
  }, [editor, document, initialContent]);


  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsEditing(true);
  };

  const handleSave = useCallback(async () => {
    // --- FIX FOR EDITOR.GET IS NOT A FUNCTION ERROR ---
    // Ensure editor and document are initialized before attempting to save.
    if (!editor || !document) {
      console.warn("Editor or document not ready for saving.");
      return;
    }

    try {
      const blockNoteContent = editor.document; // BlockNote v0.1.0+ uses editor.document directly
      // If you are using an older version of BlockNote, you might need `await editor.getBlocks()` or `await editor.getHTML()`
      // Based on your initial code, `editor.get()` was likely meant to get the JSON content.
      // For @blocknote/react v0.1.0 and above, `editor.document` holds the current content.

      await updateDocument(document.id, {
        title,
        content: blockNoteContent,
      });
      setLastSaved(new Date());
      setIsEditing(false);
      console.log("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      // You might want to show a user-friendly error message here
    }
  }, [editor, document, title, updateDocument]);

  const handleShare = async () => {
    setShareMessage(''); // Clear previous messages
    if (!shareEmail || !shareRole) {
      setShareMessage('Please enter email and select a role.');
      return;
    }
    try {
      await shareDocument(document.id, shareEmail, shareRole);
      setShareMessage(`Successfully shared with ${shareEmail} as ${shareRole}.`);
      setShareEmail('');
      setShareRole('viewer');
      setTimeout(() => setShowShareModal(false), 500); // Close modal after short delay
    } catch (error) {
      console.error('Error sharing document:', error);
      setShareMessage(`Failed to share: ${error.message}`);
      // Modal stays open for user to correct errors
    }
  };


  const canEdit = userRole === 'editor' || userRole === 'admin';
  const canShare = userRole === 'admin'; // Only admin can share
  const documentActiveUsers = activeUsers[id] || [];

  if (!document) {
    return (
      <div className="flex h-screen bg-cream dark:bg-charcoal">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Loading document or document not found...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream dark:bg-charcoal">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header />
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-md"
                  title="Go to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  disabled={!canEdit}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 w-full"
                  placeholder="Untitled"
                />
              </div>
              <div className="flex items-center gap-4">
                {/* Active Users Indicator */}
                <ActiveUsersIndicator users={documentActiveUsers} />

                {/* Share Button (only for admins) */}
                {canShare && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-md"
                    title="Share Document"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}

                {/* Comments Toggle Button */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-md"
                  title="Toggle Comments Panel"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {lastSaved && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {isEditing && canEdit && (
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2 px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 min-h-0">
              <div className="max-w-4xl mx-auto p-8">
                {editor && (
                  <BlockNoteView
                    editor={editor}
                    theme="light" // Or "dark" based on your theme
                    editable={canEdit}
                    onChange={() => canEdit && setIsEditing(true)}
                  />
                )}
              </div>
            </div>
            {showComments && (
              <CommentsPanel
                document={document}
                onClose={() => setShowComments(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Share Document Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Share Document</h3>
            <div className="mb-4">
              <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User Email
              </label>
              <input
                type="email"
                id="shareEmail"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="shareRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                id="shareRole"
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="editor">Editor (Read & Write)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
            {shareMessage && (
              <p className={`text-sm mb-4 ${shareMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                {shareMessage}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
};

export default DocumentEditor;
