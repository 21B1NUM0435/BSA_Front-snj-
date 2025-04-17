import React, { useState } from "react";
import { Tabs, Layout, Typography } from "antd";
import NotificationComposer from "./NotificationComposer";
import NotificationHistory from "./NotificationHistory";
import NotificationTemplates from "./NotificationTemplates";
import NotificationSettings from "./NotificationSettings";

const { Content } = Layout;
const { Title } = Typography;

function NotificationDashboard() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const items = [
    {
      key: "1",
      label: "Compose Notification",
      children: activeKey === "1" && <NotificationComposer />,
    },
    {
      key: "2",
      label: "Notification History",
      children: activeKey === "2" && <NotificationHistory />,
    },
    {
      key: "3",
      label: "Templates",
      children: activeKey === "3" && <NotificationTemplates />,
    },
    {
      key: "4",
      label: "Settings",
      children: activeKey === "4" && <NotificationSettings />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Notification Management</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} />
        </Content>
      </Layout>
    </div>
  );
}

export default NotificationDashboard;