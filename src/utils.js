// src/utils.js
import axios from "axios";
import { refreshAccessToken, logoutOAuth } from "./oauth";

const API_URL = "http://127.0.0.1:8000/api"; // API server base URL

/**
 * Creates headers with authentication token if available
 * @returns {Object} Headers object
 */
const createHeaders = () => {
  const token = localStorage.getItem('oauth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

/**
 * Handles authentication errors by trying to refresh the token
 * @param {Function} requestFn - The original request function to retry
 * @returns {Promise} - The result of the retried request or throws an error
 */
const handleAuthError = async (requestFn) => {
  // Try to refresh the token
  const refreshSuccess = await refreshAccessToken();
  
  if (refreshSuccess) {
    // Retry the original request with new token
    return await requestFn();
  } else {
    // If refresh failed, logout and redirect
    await logoutOAuth();
    window.location.href = '/login?error=session_expired';
    throw new Error('Authentication failed');
  }
};

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response data
 */
export const fetchData = async (endpoint, params = {}) => {
  const makeRequest = async () => {
    const response = await axios.get(`${API_URL}/${endpoint}`, {
      params,
      headers: createHeaders(),
      withCredentials: true
    });
    return response.data;
  };

  try {
    return await makeRequest();
  } catch (error) {
    // Check if error is due to authentication
    if (error.response && error.response.status === 401) {
      return await handleAuthError(makeRequest);
    }
    
    console.error("Error fetching data:", error);
    throw error;
  }
};

/**
 * Post data to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {string} method - HTTP method (post, put, etc.)
 * @returns {Promise<Object>} - API response data
 */
export const postData = async (endpoint, data, method = "post") => {
  const makeRequest = async () => {
    const response = await axios({
      method,
      url: `${API_URL}/${endpoint}`,
      data,
      headers: createHeaders(),
      withCredentials: true
    });
    return response.data;
  };

  try {
    return await makeRequest();
  } catch (error) {
    // Check if error is due to authentication
    if (error.response && error.response.status === 401) {
      return await handleAuthError(makeRequest);
    }
    
    console.error("Error sending data:", error);
    throw error;
  }
};