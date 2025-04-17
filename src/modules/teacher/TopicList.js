import { Layout, Tabs, Typography } from "antd";
import { useState } from "react";
import "../Main.css";
import CheckedTopicList from "./topiclist/CheckedTopicList";
import CheckedTopicsProposedByStud from "./topiclist/CheckedTopicsProposedByStud";
import TopicListProposedByUser from "./topiclist/TopicListProposedByUser";

const { Content } = Layout;
const { Title } = Typography;

function TopicList() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };
  const items = [
    {
      key: "1",
      label: "Сэдвийн жагсаалт",
      children: activeKey === "1" && (
        <CheckedTopicList active={activeKey === "1"} />
      ),
    },
    {
      key: "2",
      label: "Дэвшүүлсэн сэдвийн жагсаалт",
      children: activeKey === "2" && (
        <TopicListProposedByUser active={activeKey === "2"} />
      ),
    },
    {
      key: "3",
      label: "Оюутны дэвшүүлсэн сэдвийн жагсаалт",
      children: activeKey === "3" && (
        <CheckedTopicsProposedByStud active={activeKey === "3"} />
      ),
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдвийн жагсаалт</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} />
        </Content>
      </Layout>
    </div>
  );
}

export default TopicList;
