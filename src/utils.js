// src/utils.js
import api from "./api/axios";
import { notification } from "antd";

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - API response data
 */
export const fetchData = async (endpoint, params = {}) => {
  try {
    // Make the request with our enhanced API client
    const response = await api.get(`/api/${endpoint}`, { params });
    
    // Handle both response formats: direct data or {data: ...} wrapped
    const responseData = response.data && response.data.hasOwnProperty('data') 
      ? response.data.data 
      : response.data;
    
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    
    // Show notification for user
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred';
    
    notification.error({
      message: "Request Failed",
      description: errorMessage,
      duration: 5
    });
    
    throw error;
  }
};

/**
 * Post data to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {string} method - HTTP method (post, put, etc.)
 * @returns {Promise<any>} - API response data
 */
export const postData = async (endpoint, data, method = "post") => {
  try {
    let response;
    
    if (method.toLowerCase() === "post") {
      response = await api.post(`/api/${endpoint}`, data);
    } else if (method.toLowerCase() === "put") {
      response = await api.put(`/api/${endpoint}`, data);
    } else if (method.toLowerCase() === "delete") {
      response = await api.delete(`/api/${endpoint}`);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }
    
    // Handle success message if present
    if (response.data?.message) {
      notification.success({
        message: "Success",
        description: response.data.message,
        duration: 3
      });
    }
    
    // Handle both response formats: direct data or {data: ...} wrapped
    const responseData = response.data && response.data.hasOwnProperty('data') 
      ? response.data.data 
      : response.data;
    
    return responseData;
  } catch (error) {
    console.error(`Error ${method} data:`, error);
    
    // Show notification for user
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred';
    
    notification.error({
      message: "Request Failed",
      description: errorMessage,
      duration: 5
    });
    
    throw error;
  }
};

/**
 * Format data for display
 * @param {any} value - Value to format
 * @param {string} type - Type of formatting
 * @returns {string} - Formatted value
 */
export const formatData = (value, type = 'text') => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    default:
      return value;
  }
};

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} - Parsed object or default value
 */
export const safeParseJSON = (jsonString, defaultValue = {}) => {
  try {
    return typeof jsonString === 'string' 
      ? JSON.parse(jsonString) 
      : jsonString || defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

/**
 * Check if a value is empty (null, undefined, empty string/array/object)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
};