import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useApp } from './contexts/AppContext'; 
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewsAggregator from './components/NewsAggregator';
import BlogManager from './components/BlogManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Bookmarks from './pages/Bookmarks';
import Login from './pages/Login';

// Define the props interface for the ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode; 
}

// Correctly type the ProtectedRoute component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useApp();
  return state.user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/news" element={<NewsAggregator />} />

                {/* Protected Routes */}
                <Route path="/blog" element={<ProtectedRoute><BlogManager /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;