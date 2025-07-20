import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, Settings, LogOut, User, UserRoundPen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../contexts/ToastContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully!', 'success');
    } catch {
      showToast('Logout failed!', 'error');
    }
    setShowDropdown(false);
  };

  return (
    <header className="border-none border-gray-200 dark:border-gray-700 px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg"></div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserRoundPen className="w-8 h-8 text-gray-500 dark:text-gray-300" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block">
                {user?.name}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;