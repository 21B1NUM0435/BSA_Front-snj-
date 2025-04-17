// src/services/NotificationService.js
import { fetchData, postData } from "../utils";

/**
 * Get unread notifications for the current user
 * @returns {Promise<Array>} Array of unread notifications
 */
export const getUnreadNotifications = async () => {
  try {
    const response = await fetchData("notifications/unread");
    
    // Handle different response formats
    if (response && response.success) {
      return response.notifications || [];
    } else if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    // Rethrow the error so the component can handle it
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId The notification ID
 * @returns {Promise<boolean>} Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await postData(`notifications/${notificationId}/read`);
    return response && (response.success || response.status === 'success');
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Send a notification to specified recipients
 * @param {Object} notificationData Notification data
 * @returns {Promise<Object|null>} Response or null on error
 */
export const sendNotification = async (notificationData) => {
  try {
    return await postData("notifications", notificationData);
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
};

/**
 * Send a notification using a template
 * @param {Object} templateData Template notification data
 * @returns {Promise<Object|null>} Response or null on error
 */
export const sendTemplateNotification = async (templateData) => {
  try {
    return await postData("notifications/template", templateData);
  } catch (error) {
    console.error("Error sending template notification:", error);
    return null;
  }
};

/**
 * Subscribe to push notifications
 * @param {Object} subscription Push subscription object
 * @returns {Promise<boolean>} Success status
 */
export const subscribeToPushNotifications = async (subscription) => {
  try {
    const response = await postData("notifications/subscribe", subscription);
    return response && (response.success || response.status === 'success');
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 * @param {string} endpoint Push subscription endpoint
 * @returns {Promise<boolean>} Success status
 */
export const unsubscribeFromPushNotifications = async (endpoint) => {
  try {
    const response = await postData("notifications/unsubscribe", { endpoint });
    return response && (response.success || response.status === 'success');
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error);
    return false;
  }
};