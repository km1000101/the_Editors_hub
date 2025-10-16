import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { Bookmark } from '../types';
import {
  BookmarkIcon,
  TrashIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const Bookmarks: React.FC = () => {
  const { state, dispatch } = useApp();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('newsBookmarks');
    if (savedBookmarks) {
      const parsedBookmarks = JSON.parse(savedBookmarks);
      setBookmarks(parsedBookmarks);
      
      parsedBookmarks.forEach((bookmark: Bookmark) => {
        if (!state.bookmarks.find(b => b.id === bookmark.id)) {
          dispatch({ type: 'ADD_BOOKMARK', payload: bookmark });
        }
      });
    }
  }, []);

  const removeBookmark = (bookmarkId: string) => {
    dispatch({ type: 'REMOVE_BOOKMARK', payload: bookmarkId });
    
    const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('newsBookmarks', JSON.stringify(updatedBookmarks));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BookmarkIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            My Bookmarks
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {bookmarks.length} saved {bookmarks.length === 1 ? 'article' : 'articles'}
        </p>
      </motion.div>

      {bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Start bookmarking articles to read them later
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {bookmarks.map((bookmark, index) => (
            <motion.article
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card overflow-hidden group relative"
            >
              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                title="Remove bookmark"
              >
                <TrashIcon className="w-5 h-5" />
              </button>

              <div className="relative h-48 overflow-hidden">
                <img
                  src={bookmark.article?.urlToImage}
                  alt={bookmark.article?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {bookmark.article?.source.name}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(bookmark.article?.publishedAt || bookmark.createdAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {bookmark.article?.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {bookmark.article?.description}
                </p>

                <div className="flex items-center justify-between">
                  <a
                    href={bookmark.article?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    Read Article
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Saved {formatDate(bookmark.createdAt)}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Bookmarks;
