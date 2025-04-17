// src/oauth.js
import axios from 'axios';

// Backend API URLs
const API_URL = 'http://127.0.0.1:8000';
const OAUTH_REDIRECT_URL = `${API_URL}/oauth/redirect`;
const OAUTH_TOKEN_URL = `${API_URL}/api/oauth/token`;
const OAUTH_REFRESH_URL = `${API_URL}/api/oauth/refresh-token`;
const USER_DATA_URL = `${API_URL}/api/user`;

/**
 * Redirect the user to OAuth login page
 */
export const redirectToOAuthLogin = () => {
  // Redirect user to backend's OAuth redirect endpoint
  window.location.href = OAUTH_REDIRECT_URL;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - The authorization code received from OAuth provider
 * @param {string} state - The state parameter for CSRF protection
 * @returns {Promise<Object>} - Token response
 */
export const exchangeCodeForToken = async (code, state) => {
  try {
    const response = await axios.post(OAUTH_TOKEN_URL, { code, state });
    
    if (response.data && response.data.access_token) {
      // Store tokens in localStorage
      localStorage.setItem('oauth_token', response.data.access_token);
      
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      localStorage.setItem('expires_in', response.data.expires_in.toString());
      localStorage.setItem('token_time', response.data.token_time.toString());
      
      return response.data;
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    throw error;
  }
};

/**
 * Fetch user data with the current access token
 * @returns {Promise<Object>} - User data
 */
export const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('oauth_token');
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(USER_DATA_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

/**
 * Refresh the access token
 * @returns {Promise<boolean>} - Success state
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return false;
    }
    
    const response = await axios.post(OAUTH_REFRESH_URL, {
      refresh_token: refreshToken
    });
    
    if (response.data && response.data.access_token) {
      // Update tokens in localStorage
      localStorage.setItem('oauth_token', response.data.access_token);
      
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      localStorage.setItem('expires_in', response.data.expires_in.toString());
      localStorage.setItem('token_time', response.data.token_time.toString());
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

/**
 * Check if the current token is expired
 * @returns {boolean} - Is token expired
 */
export const isTokenExpired = () => {
  const tokenTime = parseInt(localStorage.getItem('token_time') || '0', 10);
  const expiresIn = parseInt(localStorage.getItem('expires_in') || '3600', 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Token is expired if the current time is past the expiration time
  return currentTime >= (tokenTime + expiresIn);
};

/**
 * Check if token is about to expire (within 5 minutes)
 * @returns {boolean} - Is token about to expire
 */
export const isTokenExpiring = () => {
  const tokenTime = parseInt(localStorage.getItem('token_time') || '0', 10);
  const expiresIn = parseInt(localStorage.getItem('expires_in') || '3600', 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Token is expiring if less than 5 minutes remain
  return (tokenTime + expiresIn - currentTime) < 300;
};

/**
 * Check current OAuth status and refresh token if needed
 * @returns {Promise<Object|null>} - User data or null if not authenticated
 */
export const checkOAuthStatus = async () => {
  try {
    // Check if we have a token
    const token = localStorage.getItem('oauth_token');
    
    if (!token) {
      return null;
    }
    
    // If token is expired, try to refresh it
    if (isTokenExpired()) {
      const refreshSuccess = await refreshAccessToken();
      
      if (!refreshSuccess) {
        // Clear invalid tokens
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');
        return null;
      }
    }
    // If token is about to expire, refresh in background
    else if (isTokenExpiring()) {
      refreshAccessToken().catch(console.error);
    }
    
    // Fetch and return user data
    return await fetchUserData();
  } catch (error) {
    console.error('OAuth status check failed:', error);
    return null;
  }
};

/**
 * Logout - Clear tokens and return success
 * @returns {Promise<boolean>} - Success state
 */
export const logoutOAuth = async () => {
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_in');
  localStorage.removeItem('token_time');
  return true;
};