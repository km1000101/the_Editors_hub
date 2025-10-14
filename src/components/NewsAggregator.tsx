import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { NewsArticle, Bookmark } from '../types';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  BookmarkIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const NewsAggregator: React.FC = () => {
  const { state, dispatch } = useApp();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);

  const categories = [
    'all', 'technology', 'business', 'health', 'sports', 'entertainment', 'science'
  ];

  // Mock news data - in a real app, this would come from an API
  const mockArticles: NewsArticle[] = [
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
    },
    {
      id: '4',
      title: 'New Study Reveals Benefits of Regular Exercise',
      description: 'Comprehensive research shows that consistent physical activity significantly improves mental and physical health.',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      publishedAt: '2024-01-12T14:20:00Z',
      source: { name: 'Health Weekly' },
      category: 'health'
    },
    {
      id: '5',
      title: 'Championship Finals Set for Next Weekend',
      description: 'Top teams prepare for the most anticipated championship match of the season.',
      url: '#',
      urlToImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      publishedAt: '2024-01-11T18:30:00Z',
      source: { name: 'Sports Central' },
      category: 'sports'
    }
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, page]);

  const fetchArticles = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredArticles = mockArticles;
      
      if (selectedCategory !== 'all') {
        filteredArticles = mockArticles.filter(article => 
          article.category === selectedCategory
        );
      }
      
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setArticles(filteredArticles);
      setLoading(false);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const toggleBookmark = (article: NewsArticle) => {
    const existingBookmark = state.bookmarks.find(
      bookmark => bookmark.articleId === article.id
    );

    if (existingBookmark) {
      dispatch({ type: 'REMOVE_BOOKMARK', payload: existingBookmark.id });
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        articleId: article.id,
        userId: state.user?.id || 'anonymous',
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_BOOKMARK', payload: newBookmark });
    }
  };

  const isBookmarked = (articleId: string) => {
    return state.bookmarks.some(bookmark => bookmark.articleId === articleId);
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
          Trending News
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Stay updated with the latest news from around the world
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 pr-4 py-3"
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field py-3"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {articles.map((article, index) => (
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
                    onClick={() => toggleBookmark(article)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    {isBookmarked(article.id) ? (
                      <BookmarkIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-gray-400" />
                    )}
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
                    Read More
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>

                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setPage(page + 1)}
            className="btn-primary px-8 py-3"
          >
            Load More Articles
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default NewsAggregator;
