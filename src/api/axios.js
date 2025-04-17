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
    
    // If error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          
          // Retry the original request
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens on refresh failure
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');
        
        // Redirect to login page if token refresh fails
        window.location.href = '/login?error=session_expired';
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the api instance as default
export default api;