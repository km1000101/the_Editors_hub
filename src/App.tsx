import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewsAggregator from './components/NewsAggregator';
import BlogManager from './components/BlogManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Bookmarks from './pages/Bookmarks';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<NewsAggregator />} />
                <Route path="/blog" element={<BlogManager />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
