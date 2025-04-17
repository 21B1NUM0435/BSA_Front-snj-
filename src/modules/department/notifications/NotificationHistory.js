import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Spin, Input, DatePicker, Space } from "antd";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { fetchData } from "../../../utils";
import moment from 'moment';

const { RangePicker } = DatePicker;

function NotificationHistory() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  const fetchNotificationHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchData("notifications/history");
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notification history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      // Text search
      const matchesSearch = searchText === "" || 
        notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchText.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (dateRange && dateRange.length === 2) {
        const notificationDate = moment(notification.created_at);
        matchesDate = notificationDate.isBetween(dateRange[0], dateRange[1], null, '[]');
      }
      
      return matchesSearch && matchesDate;
    });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: date => moment(date).format("YYYY-MM-DD HH:mm:ss"),
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
    },
    {
      title: "Subject",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Recipients",
      dataIndex: "recipient_count",
      key: "recipient_count",
      render: count => count,
    },
    {
      title: "Status",
      key: "status",
      render: notification => (
        <Tag color={notification.sent ? "green" : "orange"}>
          {notification.sent ? "Sent" : "Scheduled"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: notification => (
        <Space>
          <Button type="link" onClick={() => handleViewDetails(notification)}>
            View
          </Button>
          <Button type="link" onClick={() => handleResend(notification)}>
            Resend
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (notification) => {
    // Implement view details functionality
    console.log("View details for", notification);
  };

  const handleResend = (notification) => {
    // Implement resend functionality
    console.log("Resend", notification);
  };

  return (
    <Spin spinning={loading}>
      <div className="mb-4 flex justify-between">
        <Space>
          <Input
            placeholder="Search notifications"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <RangePicker
            onChange={setDateRange}
          />
        </Space>
        <Button
          icon={<SyncOutlined />}
          onClick={fetchNotificationHistory}
        >
          Refresh
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={getFilteredNotifications()}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );
}

export default NotificationHistory;