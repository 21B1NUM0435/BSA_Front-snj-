import { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import RequestedTopics from "./RequestedTopics";
import ConfirmedTopicList from "./ConfirmedTopicList";

const { Content } = Layout;
const { Title } = Typography;

function ConfirmedTopics() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`);
  };

  const items = [
    {
      key: "1",
      label: "Хүсэлт ирсэн сэдвийн жагсаалт",
      children: activeKey === "1" && <RequestedTopics />,
    },
    {
      key: "2",
      label: "Зөвшөөрсөн сэдвийн жагсаалт",
      children: activeKey === "2" && <ConfirmedTopicList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв сонгох хүсэлтийн жагсаалт</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} />
        </Content>
      </Layout>
    </div>
  );
}

export default ConfirmedTopics;
