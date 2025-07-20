import { Link, useLocation } from 'react-router-dom';
import DocumentList from './DocumentList'; // Import the new component
import {
  Edit3,
  Home,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out
        ${isOpen ? 'w-70 shadow-xl' : 'w-20 shadow-md'}
      `}
      style={{
        minWidth: isOpen ? '280px' : '80px',
        maxWidth: isOpen ? '280px' : '80px',
        boxShadow: isOpen
          ? '0 2px 16px 0 rgba(60,60,60,0.10)'
          : '0 2px 8px 0 rgba(60,60,60,0.06)',
        transition: 'min-width 0.5s cubic-bezier(0.4,0,0.2,1), max-width 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s'
      }}
    >
      {/* Logo and Collapse Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {isOpen && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Chotaa Notion</span>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(!isOpen)} className="pl-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {isOpen ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Main Dashboard Link */}
      <div className="p-4">
        <Link
            to="/dashboard"
            className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            title="Dashboard"
        >
            <Home className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="truncate">Dashboard</span>}
        </Link>
      </div>

      {/* Document List (now its own component) */}
      <DocumentList isOpen={isOpen} />

      {/* Settings */}
      {/* 
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="sidebar-item w-full" title="Settings">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="truncate">Settings</span>}
        </button>
      </div>
      */}
    </div>
  );
};

export default Sidebar;