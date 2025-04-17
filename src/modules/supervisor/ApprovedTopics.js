import React, { useState, useEffect } from "react";
import { Layout, Typography, Spin, notification, Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../utils";

const { Content } = Layout;
const { Title } = Typography;

// Хүснэгтэд харуулах багануудын тохиргоо
const columns = [
  {
    title: "Сэдвийн нэр (Монгол)", // Баганын гарчиг
    dataIndex: "name_mongolian", // Өгөгдөлд байх түлхүүр нэр
    key: "name_mongolian", // Давтагдашгүй түлхүүр
  },
  {
    title: "Сэдвийн нэр (Англи)", // Англи хэл дээрх сэдвийн нэр
    dataIndex: "name_english",
    key: "name_english",
  },
  {
    title: "Товч агуулга", // Сэдвийн товч мэдээлэл
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Төлөв", // Сэдвийн төлөв (жишээ нь, баталсан эсвэл түтгэлзүүлсэн)
    dataIndex: "status",
    key: "status",
    fixed: "right", // Баганыг баруун талд тогтмол байршуулна
    filters: [
      { text: "Баталсан", value: "approved" }, // Баталсан сэдвийг шүүх тохиргоо
      { text: "Түтгэлзүүлсэн", value: "refused" }, // Түтгэлзүүлсэн сэдвийг шүүх тохиргоо
    ],
    onFilter: (value, record) => record.status === value, // Шүүлтийн нөхцөл
    render: (status) => {
      // Төлөвийн утгаас хамаарч өнгө болон текст харуулах
      let color = status === "approved" ? "blue" : "yellow"; // Өнгөний тохиргоо
      let text = status === "approved" ? "Баталсан" : "Түтгэлзүүлсэн"; // Текстийн тохиргоо
      return <Tag color={color}>{text}</Tag>; // Таг ашиглан төлөвийн харагдах байдлыг тодорхойлох
    },
  },
];

const ApprovedTopics = () => {
  const [dataSource, setDataSource] = useState([]); // Сэдвүүдийн өгөгдөл хадгалах
  const [loading, setLoading] = useState(true); // Ачаалж байгаа төлөвийг хадгалах

  // Сэдвүүдийн өгөгдлийг серверээс татах функц
  const fetchTopics = async () => {
    try {
      const res = await fetchData("topics/reviewedtopicList"); // Сервер рүү хүсэлт илгээх
      const parsedData = res.map((item) => {
        const fields = JSON.parse(item.fields); // JSON өгөгдлийг объект болгож хөрвүүлэх
        return {
          key: item.id, // Өгөгдлийн давтагдашгүй түлхүүр
          name_mongolian: fields.find((f) => f.field === "name_mongolian")
            ?.value, // Монгол нэр авах
          name_english: fields.find((f) => f.field === "name_english")?.value, // Англи нэр авах
          description: fields.find((f) => f.field === "description")?.value, // Товч агуулга авах
          status: item.status, // Төлөв авах
        };
      });
      setDataSource(parsedData); // Өгөгдлийг хүснэгтэд дамжуулах
    } catch (error) {
      console.error("Failed to fetch topics:", error); // Алдаа гарах үед консолд хэвлэх
      notification.error({
        message: "Fetch Error", // Алдааны мессежийн гарчиг
        description: "Failed to load data: " + error.message, // Алдааны дэлгэрэнгүй мэдээлэл
      });
    } finally {
      setLoading(false); // Ачаалал дууссаныг заах
    }
  };

  useEffect(() => {
    fetchTopics(); // Анхны ачаалал дээр өгөгдөл татах
  }, []); // Хоосон хамааралтай, зөвхөн анхны ачаалал дээр ажиллана

  return (
    <div className="p-4 bg-transparent">
      {/* Хуудасны гарчиг */}
      <header className="text-left mb-4">
        <Title level={3}>Хянасан сэдвийн жагсаалт</Title>
      </header>

      {/* Хүснэгт байрлах хэсэг */}
      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Spin spinning={loading}>
            {/* CustomTable компонент ашиглан өгөгдөл харуулах */}
            <CustomTable
              bordered // Хүснэгтэд хүрээ нэмэх
              columns={columns} // Хүснэгтийн баганы тохиргоо
              dataSource={dataSource} // Хүснэгтийн өгөгдлийн эх сурвалж
              scroll={{ x: "max-content" }} // Хүснэгтийг хэвтээ гүйлгэх тохиргоо
              hasLookupField={true} // Хайлт хийх боломжтой эсэхийг тодорхойлох
              onRefresh={fetchTopics} // Дахин ачаалах функц
            />
          </Spin>
        </Content>
      </Layout>
    </div>
  );
};

export default ApprovedTopics;
