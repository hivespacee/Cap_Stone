import { useState, useEffect } from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import { X, MessageSquare, Send, Check } from 'lucide-react';

const CommentsPanel = ({ document, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const { addComment } = useDocuments();
  const { user } = useAuth();

  useEffect(() => {
    if (document?.comments) {
      setComments(document.comments);
    }
  }, [document]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = await addComment(document.id, newComment.trim());
      setComments((prev) => [...prev, commentData]); // Append the new comment to the list
      setNewComment('');
    } 
    catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate text-white text-xs flex items-center justify-center">
                    {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.userName}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
              {comment.resolved && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3" />
                  Resolved
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows="3"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Add Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsPanel;