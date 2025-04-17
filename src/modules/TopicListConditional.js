import React, { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import { useUser } from "../context/UserContext";
import "../Main.css";

// Components for different tabs
import CheckedTopicList from "./topiclist/CheckedTopicList";
import TopicListProposedByUser from "./topiclist/TopicListProposedByUser";
import CheckedTopicsProposedByStud from "./topiclist/CheckedTopicsProposedByStud";

const { Content } = Layout;
const { Title } = Typography;

function TopicListConditional() {
  const [activeKey, setActiveKey] = useState("1");
  const { user } = useUser(); // Use context to get user information

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  if (user?.email === "student@gmail.com") {
    // Render for student user
    const studentItems = [
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
    ];

    return (
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Сэдвийн жагсаалт (Оюутан)</Title>
        </header>
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <Tabs items={studentItems} onChange={handleTabChange} />
          </Content>
        </Layout>
      </div>
    );
  } else if (user?.email === "teacher@gmail.com") {
    // Render for teacher user
    const teacherItems = [
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
          <Title level={3}>Сэдвийн жагсаалт (Багш)</Title>
        </header>
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <Tabs items={teacherItems} onChange={handleTabChange} />
          </Content>
        </Layout>
      </div>
    );
  } else {
    // Default or fallback view
    return (
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Сэдвийн жагсаалт</Title>
        </header>
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <Typography.Text type="danger">
              Хандах эрхгүй хэрэглэгч байна.
            </Typography.Text>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default TopicListConditional;
