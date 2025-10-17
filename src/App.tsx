import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NewsAggregator from "./components/NewsAggregator";
import BlogManager from "./components/BlogManager";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Bookmarks from "./pages/Bookmarks";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast"; // ✅ Toast library added
import LightRays from "./components/LightRays";

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
  // ✅ Detect current theme
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen transition-colors duration-300 relative">
            {/* Fixed background LightRays animation */}
            <div className="pointer-events-none fixed inset-0 z-0">
              <LightRays
                raysOrigin="top-center"
                raysColor="#1fbcff"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={5}
                followMouse={false}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
                className="w-full h-full"
              />
            </div>

            {/* Foreground content */}
            <div className="relative z-10">
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
          </div>

          {/* ✅ Global Toaster with Dark/Light Mode Support */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "0.95rem",
                background: prefersDark ? "#1f2937" : "#ffffff", // dark: gray-800, light: white
                color: prefersDark ? "#ffffff" : "#111827", // dark: white text, light: black text
              },
              success: {
                iconTheme: {
                  primary: "#3b82f6", // Tailwind blue-500
                  secondary: "#fff",
                },
              },
            }}
            containerStyle={{ top: 20, right: 20 }}
          />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
