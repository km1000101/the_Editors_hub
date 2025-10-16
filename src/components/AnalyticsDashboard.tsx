import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
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
  ResponsiveContainer,
  Brush
} from 'recharts';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard: React.FC = () => {
  const { state } = useApp();
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    postViews: [],
    postLikes: [],
    comments: [],
    topPosts: []
  });
  const [rangeIndex, setRangeIndex] = useState<{ startIndex: number; endIndex: number } | null>(null);

  useEffect(() => {
    // Always generate analytics for blog posts only
    generateAnalyticsData();
  }, [state.blogPosts]);

  const generateAnalyticsData = () => {
    const currentUsername = state.user?.username;
    const userPosts = currentUsername
      ? state.blogPosts.filter(post => post.author === currentUsername)
      : state.blogPosts;

    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    // Build deterministic, user-specific time series from saved data
    const viewsPerDay: Record<string, number> = Object.fromEntries(last30Days.map(d => [d, 0]));
    const likesPerDay: Record<string, number> = Object.fromEntries(last30Days.map(d => [d, 0]));
    const commentsPerDay: Record<string, number> = Object.fromEntries(last30Days.map(d => [d, 0]));

    userPosts.forEach(post => {
      const created = new Date(post.createdAt);
      // Only consider the last 30 days window
      const start = new Date(now);
      start.setDate(start.getDate() - 29);

      const effectiveStart = created > start ? created : start;
      const daysBetween = Math.max(1, Math.floor((now.getTime() - effectiveStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);

      // Evenly distribute views and likes across the period from effectiveStart to now
      const baseViews = Math.floor(post.views / daysBetween);
      const extraViews = post.views % daysBetween;
      const baseLikes = Math.floor(post.likes / daysBetween);
      const extraLikes = post.likes % daysBetween;

      for (let i = 0; i < daysBetween; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        if (d < effectiveStart) break;
        const key = d.toISOString().split('T')[0];
        if (viewsPerDay[key] !== undefined) {
          viewsPerDay[key] += baseViews + (i < extraViews ? 1 : 0);
        }
        if (likesPerDay[key] !== undefined) {
          likesPerDay[key] += baseLikes + (i < extraLikes ? 1 : 0);
        }
      }

      // Aggregate actual comments by their timestamps
      post.comments.forEach(c => {
        const cDate = new Date(c.createdAt);
        const key = cDate.toISOString().split('T')[0];
        if (commentsPerDay[key] !== undefined) {
          commentsPerDay[key] += 1;
        }
      });
    });

    const postViews = last30Days.map(date => ({ date, views: viewsPerDay[date] }));
    const postLikes = last30Days.map(date => ({ date, likes: likesPerDay[date] }));
    const comments = last30Days.map(date => ({ date, comments: commentsPerDay[date] }));

    const topPosts = userPosts
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

  const filteredViews = useMemo(() => {
    if (!rangeIndex) return analytics.postViews;
    return analytics.postViews.slice(rangeIndex.startIndex, rangeIndex.endIndex + 1);
  }, [analytics.postViews, rangeIndex]);

  const filteredLikes = useMemo(() => {
    if (!rangeIndex) return analytics.postLikes;
    return analytics.postLikes.slice(rangeIndex.startIndex, rangeIndex.endIndex + 1);
  }, [analytics.postLikes, rangeIndex]);

  const filteredComments = useMemo(() => {
    if (!rangeIndex) return analytics.comments;
    return analytics.comments.slice(rangeIndex.startIndex, rangeIndex.endIndex + 1);
  }, [analytics.comments, rangeIndex]);

  const userBlogPosts = state.user ? state.blogPosts.filter(p => p.author === state.user?.username) : state.blogPosts;
  const totalViews = userBlogPosts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = userBlogPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = userBlogPosts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalPosts = userBlogPosts.length;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const isDark = theme === 'dark';
  const axisTickColor = isDark ? '#E5E7EB' : '#374151';
  const axisLineColor = isDark ? '#4B5563' : '#D1D5DB';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const tooltipBg = isDark ? '#111827' : '#FFFFFF';
  const tooltipFg = isDark ? '#F9FAFB' : '#111827';

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
        {/* Data source toggle removed to lock analytics to Blog */}
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
            <AreaChart data={analytics.postViews}
              onMouseUp={(e: any) => {
                if (e && e.activeLabel && e.brushIndex !== undefined) return; // ignore
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: axisTickColor }}
                axisLine={{ stroke: axisLineColor }}
                tickLine={{ stroke: axisLineColor }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12, fill: axisTickColor }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: axisLineColor, color: tooltipFg }}
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
              <Brush dataKey="date" travellerWidth={8} height={24} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                onChange={(range: any) => {
                  if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                    setRangeIndex({ startIndex: range.startIndex, endIndex: range.endIndex });
                  } else {
                    setRangeIndex(null);
                  }
                }}
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: axisTickColor }}
                axisLine={{ stroke: axisLineColor }}
                tickLine={{ stroke: axisLineColor }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12, fill: axisTickColor }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: axisLineColor, color: tooltipFg }}
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
              <Brush dataKey="date" travellerWidth={8} height={24} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                onChange={(range: any) => {
                  if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                    setRangeIndex({ startIndex: range.startIndex, endIndex: range.endIndex });
                  } else {
                    setRangeIndex(null);
                  }
                }}
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: axisTickColor }}
                axisLine={{ stroke: axisLineColor }}
                tickLine={{ stroke: axisLineColor }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12, fill: axisTickColor }} axisLine={{ stroke: axisLineColor }} tickLine={{ stroke: axisLineColor }} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: axisLineColor, color: tooltipFg }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Bar dataKey="comments" fill="#10B981" />
              <Brush dataKey="date" travellerWidth={8} height={24} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                onChange={(range: any) => {
                  if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                    setRangeIndex({ startIndex: range.startIndex, endIndex: range.endIndex });
                  } else {
                    setRangeIndex(null);
                  }
                }}
              />
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

        {/* Engagement Split (Pie) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Engagement Split (Views vs Likes)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: axisLineColor, color: tooltipFg }} />
              <Legend wrapperStyle={{ color: axisTickColor }} />
              <Pie
                data={[
                  { name: 'Views', value: totalViews },
                  { name: 'Likes', value: totalLikes },
                  { name: 'Comments', value: totalComments }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#EF4444" />
                <Cell fill="#10B981" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Engagement Overview removed as requested */}
    </div>
  );
};

export default AnalyticsDashboard;
