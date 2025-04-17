// src/auth/OAuthCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken, fetchUserData } from '../oauth';
import { useUser } from '../context/UserContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the authorization code and state from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        console.log('Authorization callback received with code:', code ? 'present' : 'missing');
        
        if (!code) {
          setError('No authorization code found in URL');
          setStatus('Authorization failed. Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Exchange authorization code for tokens
        setStatus('Exchanging code for tokens...');
        const tokenData = await exchangeCodeForToken(code, state);
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Failed to obtain access token');
        }
        
        // Fetch user data with the new token
        setStatus('Fetching user information...');
        const userData = await fetchUserData();
        
        // Update global user state
        setUser(userData);
        
        // Success, redirect to home
        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(`Authentication error: ${error.message}`);
        setStatus('Authentication failed. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [navigate, location, setUser]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        
        <div className="mb-4">
          <p className="text-gray-700">{status}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;