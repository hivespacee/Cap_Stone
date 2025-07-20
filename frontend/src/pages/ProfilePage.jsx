import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const { documents, folders } = useDocuments();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-cream dark:bg-slate-dark *:border-none">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8">
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
              
              </div>

            
              <div className="space-y-6">
                <div>
                  
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  
                  <input type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"/>
                </div>

                <div>
                  
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input type="email" value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"/>
                
                </div>

                
              </div>

              
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-slate">{documents.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Documents</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-slate">{folders.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Folders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
