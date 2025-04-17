// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookie-based authentication
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('oauth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Don't retry if we've already tried to refresh
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If error is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token available, cannot refresh
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const response = await axios.post('http://127.0.0.1:8000/api/oauth/refresh-token', {
          refresh_token: refreshToken
        });
        
        if (response.data && response.data.access_token) {
          // Store the new tokens
          localStorage.setItem('oauth_token', response.data.access_token);
          
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          
          localStorage.setItem('expires_in', response.data.expires_in.toString());
          localStorage.setItem('token_time', response.data.token_time.toString());
          
          // Update the Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token: invalid response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens on refresh failure
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');
        
        // Dispatch event so app can handle auth failure
        window.dispatchEvent(new CustomEvent('auth:failed'));
        
        // Redirect to login page if token refresh fails
        // Use a callback to allow the app to handle this
        if (typeof api.onAuthFailure === 'function') {
          api.onAuthFailure();
        } else {
          // Default behavior
          window.location.href = '/login?error=session_expired';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

// Set a callback for auth failures
api.setAuthFailureHandler = (callback) => {
  api.onAuthFailure = callback;
};

// Helper for detailed logging
const logError = (method, url, error) => {
  console.error(`API ${method} request to ${url} failed:`, 
    error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
};

// Enhance api with better error handling
const enhancedApi = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      logError('PUT', url, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      logError('DELETE', url, error);
      throw error;
    }
  },
  
  // Add original axios instance and helper methods
  instance: api,
  setAuthFailureHandler: api.setAuthFailureHandler
};

export default enhancedApi;