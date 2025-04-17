// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Main from "./modules/Main";
import OAuthCallback from "./auth/OAuthCallback";
import { checkOAuthStatus, logoutOAuth } from "./oauth";
import { UserProvider, useUser } from "./context/UserContext";

function AppContent() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const userData = await checkOAuthStatus();
        if (userData) {
          console.log("User authenticated:", userData);
          setUser(userData);
          setAuthError(null);
        } else {
          console.log("No authenticated user found");
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Set up a timer to periodically check authentication status
    const authCheckInterval = setInterval(checkAuth, 10 * 60 * 1000); // Check every 10 minutes
    
    return () => {
      clearInterval(authCheckInterval); // Clean up on unmount
    };
  }, [setUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          !user ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        {/* OAuth callback route */}
        <Route path="/auth" element={<OAuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          user ? (
            <Main setUser={setUser} logoutFunction={logoutOAuth} />
          ) : (
            <Navigate to={`/login${authError ? `?error=${encodeURIComponent(authError)}` : ''}`} replace />
          )
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;