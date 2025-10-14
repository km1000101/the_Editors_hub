import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { AnalyticsData } from '../types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard: React.FC = () => {
  const { state } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    postViews: [],
    postLikes: [],
    comments: [],
    topPosts: []
  });

  useEffect(() => {
    generateAnalyticsData();
  }, [state.blogPosts]);

  const generateAnalyticsData = () => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    // Generate mock analytics data based on blog posts
    const postViews = last30Days.map(date => ({
      date,
      views: Math.floor(Math.random() * 100) + state.blogPosts.length * 5
    }));

    const postLikes = last30Days.map(date => ({
      date,
      likes: Math.floor(Math.random() * 50) + state.blogPosts.length * 2
    }));

    const comments = last30Days.map(date => ({
      date,
      comments: Math.floor(Math.random() * 20) + state.blogPosts.length
    }));

    const topPosts = state.blogPosts
      .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
      .slice(0, 5)
      .map(post => ({
        title: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
        views: post.views,
        likes: post.likes
      }));

    setAnalytics({
      postViews,
      postLikes,
      comments,
      topPosts
    });
  };

  const totalViews = analytics.postViews.reduce((sum, item) => sum + item.views, 0);
  const totalLikes = analytics.postLikes.reduce((sum, item) => sum + item.likes, 0);
  const totalComments = analytics.comments.reduce((sum, item) => sum + item.comments, 0);
  const totalPosts = state.blogPosts.length;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const stats = [
    {
      name: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900'
    },
    {
      name: 'Total Comments',
      value: totalComments.toLocaleString(),
      icon: ChatBubbleLeftIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Total Posts',
      value: totalPosts.toLocaleString(),
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Track your content performance and engagement metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Views Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.postViews}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Likes Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Likes Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.postLikes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Line 
                type="monotone" 
                dataKey="likes" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Comments Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Comments Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.comments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Bar dataKey="comments" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Posts
          </h3>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {post.views}
                      </span>
                      <span className="flex items-center">
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Engagement Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Engagement Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Average Views per Post
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Average Likes per Post
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Average Comments per Post
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
