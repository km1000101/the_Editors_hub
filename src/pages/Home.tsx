import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  NewspaperIcon, 
  PencilSquareIcon, 
  ChartBarIcon,
  BookmarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      icon: <NewspaperIcon className="w-8 h-8" />,
      title: 'News Aggregator',
      description: 'Stay updated with the latest trending articles from around the world. Search, filter, and bookmark your favorite news.',
      link: '/news',
      color: 'bg-blue-500'
    },
    {
      icon: <PencilSquareIcon className="w-8 h-8" />,
      title: 'Personal Blog',
      description: 'Create, edit, and manage your own blog posts. Share your thoughts with a rich text editor and comment system.',
      link: '/blog',
      color: 'bg-green-500'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Track your content performance with interactive charts. Monitor views, likes, and engagement metrics.',
      link: '/analytics',
      color: 'bg-purple-500'
    },
    {
      icon: <BookmarkIcon className="w-8 h-8" />,
      title: 'Bookmarks',
      description: 'Save your favorite articles and posts for later reading. Organize your content library efficiently.',
      link: '/bookmarks',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Editor's Hub
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              A modern platform that combines news aggregation, personal blogging, and analytics 
              in one powerful application. Create, discover, and analyze content like never before.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/news"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                Explore News
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/blog"
                className="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                Start Writing
                <PencilSquareIcon className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our platform provides all the tools you need to stay informed, create content, and track your success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card p-6 text-center group hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              <Link
                to={feature.link}
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Learn More
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Thousands of users are already creating amazing content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Articles Read
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                5K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Blog Posts Created
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                2K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Active Users
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
