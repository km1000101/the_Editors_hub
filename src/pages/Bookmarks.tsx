import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { BookmarkIcon, ArrowTopRightOnSquareIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

const Bookmarks: React.FC = () => {
  const { state, dispatch } = useApp();

  // Mock bookmarked articles - in a real app, this would be fetched based on bookmark IDs
  const bookmarkedArticles = [
    {
      id: '1',
      title: 'Revolutionary AI Technology Transforms Healthcare Industry',
      description: 'New artificial intelligence breakthroughs are revolutionizing patient care and medical diagnosis across the globe.',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      publishedAt: '2024-01-15T10:30:00Z',
      source: { name: 'Tech News' },
      category: 'technology'
    },
    {
      id: '2',
      title: 'Global Markets Show Strong Recovery in Q4',
      description: 'Financial markets worldwide demonstrate resilience with significant gains across major indices.',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
      publishedAt: '2024-01-14T15:45:00Z',
      source: { name: 'Business Today' },
      category: 'business'
    },
    {
      id: '3',
      title: 'Breakthrough in Renewable Energy Storage',
      description: 'Scientists develop new battery technology that could make renewable energy more reliable and affordable.',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop',
      publishedAt: '2024-01-13T09:15:00Z',
      source: { name: 'Science Daily' },
      category: 'science'
    }
  ];

  const handleRemoveBookmark = (articleId: string) => {
    const bookmark = state.bookmarks.find(b => b.articleId === articleId);
    if (bookmark) {
      dispatch({ type: 'REMOVE_BOOKMARK', payload: bookmark.id });
    }
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          My Bookmarks
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your saved articles and favorite content
        </p>
      </motion.div>

      {/* Bookmarks Grid */}
      {bookmarkedArticles.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {bookmarkedArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleRemoveBookmark(article.id)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {article.source.name}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {article.description}
                </p>

                <div className="flex items-center justify-between">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Read Article
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>

                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookmarkIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Start bookmarking articles you find interesting to save them for later reading.
          </p>
          <a
            href="/news"
            className="btn-primary"
          >
            Browse News
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default Bookmarks;
