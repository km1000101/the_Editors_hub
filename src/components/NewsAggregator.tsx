import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { NewsArticle, Bookmark, AnalyticsData } from '../types';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  BookmarkIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const NewsAggregator: React.FC = () => {
  const { state, dispatch } = useApp();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [page, setPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const API_KEY = 'fe701bdebe414e56b3cd43387ae668d8';
  const categories = [
    'general', 'technology', 'business', 'health', 'sports', 'entertainment', 'science'
  ];

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en')
      );
      setSelectedVoice(englishVoice || availableVoices[0]);
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakArticle = (article: NewsArticle) => {
    const isThisArticlePlaying = isSpeaking && currentSpeakingId === article.id;

    if (isThisArticlePlaying) {
      // STOP Logic: If the same article is currently playing, stop it.
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      setIsPaused(false);
      return; // Exit the function after stopping
    }
    window.speechSynthesis.cancel();

    const textToSpeak = `${article.title}. ${article.description || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.9; 
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(article.id);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePauseSpeech = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
    setIsPaused(false);
  };

  const readTrendingNews = () => {
    if (articles.length === 0) return;

    stopSpeech();
    
    const introText = `Here are today's trending news headlines. Article 1: ${articles[0]?.title}. ${articles[0]?.description || ''}`;
    const utterance = new SpeechSynthesisUtterance(introText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    let currentIndex = 0;

    utterance.onend = () => {
      currentIndex++;
      if (currentIndex < Math.min(5, articles.length)) {
        const nextArticle = articles[currentIndex];
        const nextText = `Article ${currentIndex + 1}: ${nextArticle.title}. ${nextArticle.description || ''}`;
        const nextUtterance = new SpeechSynthesisUtterance(nextText);
        
        if (selectedVoice) {
          nextUtterance.voice = selectedVoice;
        }
        
        nextUtterance.rate = 0.9;
        nextUtterance.pitch = 1;
        nextUtterance.volume = 1;
        nextUtterance.onend = utterance.onend;
        
        setCurrentSpeakingId(nextArticle.id);
        window.speechSynthesis.speak(nextUtterance);
      } else {
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
      }
    };

    setIsSpeaking(true);
    setCurrentSpeakingId(articles[0].id);
    window.speechSynthesis.speak(utterance);
  };

  const fetchArticles = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    if (loading || (!hasMore && !isNewSearch)) return;
    
    setLoading(true);
    setError('');
    
    try {
      const categoryParam = selectedCategory === 'general' ? '' : `&category=${selectedCategory}`;
      const searchParam = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : '';
      const url = `https://newsapi.org/v2/top-headlines?country=us${categoryParam}${searchParam}&pageSize=20&page=${pageNum}&apiKey=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const articlesWithCategory = data.articles.map((article: any, index: number) => ({
          ...article,
          id: `${Date.now()}-${pageNum}-${index}`,
          category: selectedCategory,
          urlToImage: article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop'
        }));
        
        if (isNewSearch) {
          setArticles(articlesWithCategory);
        } else {
          setArticles(prev => [...prev, ...articlesWithCategory]);
        }

        // Persist in global state for analytics consumers
        const combined = isNewSearch ? articlesWithCategory : [...articles, ...articlesWithCategory];
        dispatch({ type: 'SET_NEWS_ARTICLES', payload: combined });

        // Compute lightweight simulated analytics based on fetched news
        const now = new Date();
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });

        const base = combined.length;
        const postViews = last30Days.map(date => ({
          date,
          views: Math.floor(Math.random() * 150) + base * 3
        }));
        const postLikes = last30Days.map(date => ({
          date,
          likes: Math.floor(Math.random() * 70) + base
        }));
        const comments = last30Days.map(date => ({
          date,
          comments: Math.floor(Math.random() * 40) + Math.floor(base / 3)
        }));

        // Derive "topPosts" from article titles using randomized engagement proxies
        const topPosts = combined
          .slice(0, 10)
          .map((a: NewsArticle) => ({
            title: (a.title || 'Untitled').length > 30 ? (a.title || 'Untitled').substring(0, 30) + '...' : (a.title || 'Untitled'),
            views: Math.floor(Math.random() * 1000) + 100,
            likes: Math.floor(Math.random() * 300) + 20
          }))
          .sort((a: { title: string; views: number; likes: number }, b: { title: string; views: number; likes: number }) => (b.views + b.likes) - (a.views + a.likes))
          .slice(0, 5);

        const analytics: AnalyticsData = { postViews, postLikes, comments, topPosts };
        dispatch({ type: 'UPDATE_NEWS_ANALYTICS', payload: analytics });
        
        setHasMore(data.articles.length === 20);
      } else {
        setError(data.message || 'Failed to fetch articles');
        setHasMore(false);
      }
    } catch (err) {
      setError('Failed to fetch articles. Please check your API key and internet connection.');
      console.error('Error fetching articles:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, API_KEY, loading, hasMore]);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    stopSpeech();
    fetchArticles(1, true);
  }, [selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && articles.length > 0) {
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchArticles(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, articles.length, fetchArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setArticles([]);
    setPage(1);
    setHasMore(true);
    stopSpeech();
    fetchArticles(1, true);
  };

  const toggleBookmark = (article: NewsArticle) => {
    const existingBookmark = state.bookmarks.find(
      bookmark => bookmark.articleId === article.id
    );

    if (existingBookmark) {
      dispatch({ type: 'REMOVE_BOOKMARK', payload: existingBookmark.id });
      
      const savedBookmarks = JSON.parse(localStorage.getItem('newsBookmarks') || '[]');
      const updatedBookmarks = savedBookmarks.filter((b: Bookmark) => b.id !== existingBookmark.id);
      localStorage.setItem('newsBookmarks', JSON.stringify(updatedBookmarks));
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        articleId: article.id,
        userId: state.user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        article: article
      };
      dispatch({ type: 'ADD_BOOKMARK', payload: newBookmark });
      
      const existingBookmarks = JSON.parse(localStorage.getItem('newsBookmarks') || '[]');
      localStorage.setItem('newsBookmarks', JSON.stringify([...existingBookmarks, newBookmark]));
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(5, articles.length));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(5, articles.length)) % Math.min(5, articles.length));
  };

  useEffect(() => {
    if (articles.length > 0) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [articles.length, currentSlide]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        
      {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative mb-12 h-96 rounded-2xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <img
                src={articles[currentSlide]?.urlToImage}
                alt={articles[currentSlide]?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                {currentSpeakingId === articles[currentSlide]?.id && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 bg-green-500 rounded-full text-sm font-medium animate-pulse">
                      <SpeakerWaveIcon className="w-4 h-4 mr-1" />
                      Now Playing
                    </span>
                  </div>
                )}
                
                <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-medium mb-3">
                  {articles[currentSlide]?.source.name}
                </span>
                <h2 className="text-3xl font-bold mb-3 line-clamp-2">
                  {articles[currentSlide]?.title}
                </h2>
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {articles[currentSlide]?.description}
                </p>
                <div className="flex items-center space-x-4">
                  <a
                    href={articles[currentSlide]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    Read Article
                  </a>
                  
                  <button
                    onClick={() => speakArticle(articles[currentSlide])}
                    className="p-2 bg-green-500/80 backdrop-blur-sm rounded-lg hover:bg-green-600 transition-colors"
                    title="Listen to this article"
                  >
                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                  </button>

                  <button
                    onClick={() => toggleBookmark(articles[currentSlide])}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    {isBookmarked(articles[currentSlide]?.id) ? (
                      <BookmarkSolidIcon className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {articles.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )} 
<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Trending News
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Stay updated with the latest news from around the world
        </p>

        <div className="flex justify-center items-center space-x-4 mb-4">
          <button
            onClick={readTrendingNews}
            disabled={articles.length === 0 || isSpeaking}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <SpeakerWaveIcon className="w-5 h-5 mr-2" />
            Read Top 5 News
          </button>

          {isSpeaking && (
            <>
              <button
                onClick={togglePauseSpeech}
                className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                {isPaused ? (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <PauseIcon className="w-5 h-5 mr-2" />
                    Pause
                  </>
                )}
              </button>

              <button
                onClick={stopSpeech}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <SpeakerXMarkIcon className="w-5 h-5 mr-2" />
                Stop
              </button>
            </>
          )}
        </div>

        {voices.length > 0 && (
          <div className="flex justify-center items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Voice:</label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value);
                setSelectedVoice(voice || null);
              }}
              className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 pr-4 py-3 w-full"
              />
            </div>
          </form>

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

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {articles.length === 0 && loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
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
                transition={{ duration: 0.8, delay: Math.min(index * 0.05, 0.5) }}
                whileHover={{ y: -5 }}
                className={`card overflow-hidden group relative ${
                  currentSpeakingId === article.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {currentSpeakingId === article.id && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium animate-pulse">
                      <SpeakerWaveIcon className="w-3 h-3 mr-1" />
                      Playing
                    </span>
                  </div>
                )}

                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => speakArticle(article)}
                      className="p-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-colors"
                      title="Listen to article"
                    >
                      <SpeakerWaveIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => toggleBookmark(article)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      {isBookmarked(article.id) ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

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

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5 mr-2" />
                    Read Full Article
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <div ref={observerTarget} className="flex justify-center items-center py-8">
            {loading && (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            )}
            {!hasMore && articles.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No more articles to load
              </p>
            )}
          </div>
        </>
      )}

      {articles.length === 0 && !loading && (
        <div className="text-center py-20">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No articles found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsAggregator;
