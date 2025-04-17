import React, { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import SendPropTopic from "./SendPropTopic";
import DraftList from "./DraftList";

const { Content } = Layout;
const { Title } = Typography;

function ProposeTopicStud() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`);
  };

  const items = [
    {
      key: "1",
      label: "Сэдэв дэвшүүлэх",
      children: activeKey === "1" && <SendPropTopic />,
    },
    {
      key: "2",
      label: "Ноорог",
      children: activeKey === "2" && <DraftList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв дэвшүүлэх</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} />
        </Content>
      </Layout>
    </div>
  );
}

export default ProposeTopicStud;
