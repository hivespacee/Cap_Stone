import { useState } from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { useToast } from '../contexts/ToastContext';
import { X, Mail, UserPlus, Check } from 'lucide-react';

const ShareDocumentModal = ({ isOpen, onClose, document }) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const { shareDocument } = useDocuments();
  const { showToast } = useToast();

  const roles = [
    { value: 'viewer', label: 'Can view', description: 'Can only read the document' },
    { value: 'editor', label: 'Can edit', description: 'Can read and edit the document' },
    { value: 'admin', label: 'Full access', description: 'Can read, edit, and manage sharing' }
  ];

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await shareDocument(document.id, email.trim(), selectedRole);
      showToast(`Document shared with ${email}`, 'success');
      setEmail('');
      onClose();
    } catch (error) {
      showToast('Failed to share document', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 animate-slide-up transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share "{document?.title}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission level
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedRole === role.value 
                      ? 'border-slate bg-slate' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedRole === role.value && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {role.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareDocumentModal;