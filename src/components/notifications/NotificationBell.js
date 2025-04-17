// src/components/notifications/NotificationBell.js
import React, { useState, useEffect } from "react";
import { Badge, Popover, List, Button, Empty, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { getUnreadNotifications, markNotificationAsRead } from "../../services/NotificationService";
import moment from "moment";

function NotificationBell() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getUnreadNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible);
  };

  const content = (
    <div style={{ width: 300, maxHeight: 400, overflow: "auto" }}>
      <Spin spinning={loading}>
        {notifications.length > 0 ? (
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
                      <div className="notification-time">
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
      title="Notifications"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      placement="bottomRight"
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