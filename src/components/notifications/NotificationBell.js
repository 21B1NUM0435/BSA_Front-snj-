// src/components/notifications/NotificationBell.js
import React, { useState, useEffect, useCallback } from "react";
import { Badge, Popover, List, Button, Empty, Spin, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { getUnreadNotifications, markNotificationAsRead } from "../../services/NotificationService";
import { useUser } from "../../context/UserContext";
import moment from "moment";

function NotificationBell() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Define fetchNotifications with useCallback to avoid recreation on each render
  const fetchNotifications = useCallback(async () => {
    // Don't try to fetch if no user is logged in
    if (!user) {
      setError("Please log in to view notifications");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUnreadNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
      
      // Don't show this message if it's an auth error - user might not be logged in yet
      if (error.response?.status !== 401) {
        message.error("Could not fetch notifications");
      }
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as a dependency since we use it in the function

  // Only fetch notifications when user is logged in and popover is visible
  useEffect(() => {
    if (visible && user) {
      fetchNotifications();
    }
  }, [visible, user, fetchNotifications]); // Add fetchNotifications as dependency

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      
      // Remove from local list
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      // Redirect if URL is provided
      if (notification.url) {
        window.location.href = notification.url;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
      message.error("Could not mark notification as read");
    }
  };

  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };
  
  const handleRefresh = () => {
    fetchNotifications();
  };

  const content = (
    <div style={{ width: 300, maxHeight: 400, overflow: "auto" }}>
      <Spin spinning={loading}>
        {error ? (
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <Button size="small" onClick={handleRefresh}>Try Again</Button>
          </div>
        ) : notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => handleNotificationClick(item)}
                  >
                    {item.url ? "View" : "Mark Read"}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={
                    <div>
                      <div className="notification-content">{item.content}</div>
                      <div className="notification-time text-gray-500 text-xs mt-1">
                        {moment(item.created_at).fromNow()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No new notifications" />
        )}
      </Spin>
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button type="text" size="small" onClick={handleRefresh}>
              Refresh
            </Button>
          )}
        </div>
      }
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomRight"
      overlayStyle={{ width: 300 }}
    >
      <Badge count={notifications.length} overflowCount={99} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          size="large"
          className="notification-bell"
        />
      </Badge>
    </Popover>
  );
}

export default NotificationBell;