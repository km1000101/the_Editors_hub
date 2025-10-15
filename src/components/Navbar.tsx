import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';

import { 
  SunIcon, 
  MoonIcon, 
  HomeIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  UserIcon,
  BookmarkIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useApp(); // Need dispatch for logout
  const navigate = useNavigate();

  const handleLogout = () => {
    // Dispatch action to clear user state (defined in AppContext.tsx)
    dispatch({ type: 'SET_USER', payload: null }); 
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Editor's Hub
              </span>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/news"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>News</span>
            </Link>
            
            {/* Merged Conditional Links (Only for logged-in users) */}
            {state.user && (
              <>
                <Link
                  to="/blog"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Blog</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/bookmarks"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <BookmarkIcon className="w-5 h-5" />
                  <span>Bookmarks</span>
                </Link>
              </>
            )}
          </div>

          {/* Right side: User/Auth & Theme Toggle */}
          <div className="flex items-center space-x-4">
            
            {/* User/Auth Section */}
            {state.user ? (
              // SHOW LOGOUT BUTTON AND USER NAME
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {state.user.username}
                </span>
                
                <motion.button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              // SHOW LOGIN BUTTON
              <Link
                to="/login"
                className="btn-primary"
              >
                Login
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (Keep your existing mobile menu structure) */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-900">
          <Link to="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <Link to="/news" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">News</Link>
          {/* Mobile conditional links */}
          {state.user && (
            <>
              <Link to="/blog" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Blog</Link>
              <Link to="/analytics" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Analytics</Link>
              <Link to="/bookmarks" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Bookmarks</Link>
            </>
          )}
          
          {/* Mobile Auth Button */}
          {state.user ? (
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Logout</button>
          ) : (
            <Link to="/login" className="w-full text-left block px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
