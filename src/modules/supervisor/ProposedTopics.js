import React, { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Tabs, Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";

const { Content } = Layout;
const { Title } = Typography;

const ProposedTopics = () => {
  const [activeKey, setActiveKey] = useState("1"); // Идэвхтэй табын түлхүүр хадгалах
  const [loading, setLoading] = useState(false); // Өгөгдөл ачаалж байгаа эсэхийг заах
  const [dataSource, setDataSource] = useState([]); // Хүснэгтийн өгөгдлийг хадгалах
  const [columns, setColumns] = useState([]); // Хүснэгтийн багануудыг хадгалах
  const [isModalOpen, setIsModalOpen] = useState(false); // Дэлгэрэнгүй цонх нээлттэй эсэхийг заах
  const [selectedRowData, setSelectedRowData] = useState(null); // Сонгосон мөрний өгөгдлийг хадгалах

  // Таб солигдох үед идэвхтэй табын түлхүүрийг шинэчлэх
  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`); // Шинэ табын түлхүүрийг консолд хэвлэх
  };

  // Сэдвүүдийг серверээс татах функц
  const fetchTopics = useCallback(async () => {
    setLoading(true); // Ачаалал эхэлснийг заах

    try {
      const type = activeKey === "1" ? "teacher" : "student"; // Табын түлхүүрээс хамааран төрөл тодорхойлох
      const endpoint = `topics/submittedby/${type}`; // Тохирох API endpoint-ыг ашиглах
      const rawData = await fetchData(endpoint); // Серверээс өгөгдөл татах

      const transformedData = rawData.map((item) => {
        // Өгөгдлийг тохирох формат руу хөрвүүлэх
        const fieldsArray = JSON.parse(item.fields);
        const fieldsObject = fieldsArray.reduce(
          (acc, field) => ({
            ...acc,
            [field.field]: field.value,
            [`${field.field}_name`]: field.field2,
          }),
          {}
        );
        return { ...item, ...fieldsObject, key: item.id, type }; // Өгөгдөлд key болон type нэмэх
      });

      setDataSource(transformedData); // Хүснэгтийн өгөгдлийг шинэчлэх

      if (transformedData.length > 0) {
        // Хүснэгтийн баганы тохиргоо хийх
        const dynamicColumns = JSON.parse(transformedData[0].fields)
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(
              field.field
            )
          )
          .map((field) => ({
            title: field.field2, // Баганын гарчиг
            dataIndex: field.field, // Өгөгдөл авах түлхүүр
            key: field.field,
          }));

        // Үйлдэл багана нэмэх
        dynamicColumns.push({
          title: "Үйлдэл",
          key: "actions",
          fixed: "right", // Баруун талд тогтмол байршуулах
          width: 150,
          render: (_, record) => (
            <Button type="default" onClick={() => handleDetails(record)}>
              Дэлгэрэнгүй
            </Button>
          ),
        });

        setColumns(dynamicColumns); // Багануудыг хадгалах
      }
    } catch (error) {
      // Алдаа гарвал мэдэгдэл харуулах
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Мэдээлэл татахад алдаа гарлаа. Дахин оролдоно уу!",
      });
    } finally {
      setLoading(false); // Ачаалал дууссаныг заах
    }
  }, [activeKey]);

  // Анхны ачааллын үед болон таб солигдох үед өгөгдөл татах
  useEffect(() => {
    fetchTopics();
    const intervalId = setInterval(fetchTopics, 5000); // Өгөгдлийг 5 секунд тутамд шинэчлэх

    return () => clearInterval(intervalId); // Interval-ийг цэвэрлэх
  }, [fetchTopics]);

  // Дэлгэрэнгүй цонхыг нээх функц
  const handleDetails = (record) => {
    setSelectedRowData(record); // Сонгосон мөрийн өгөгдлийг хадгалах
    setIsModalOpen(true); // Цонхыг нээх
  };

  // Дэлгэрэнгүй цонхыг хаах функц
  const closeDetailModal = () => {
    setIsModalOpen(false); // Цонхыг хаах
  };

  // Табын тохиргоо
  const items = [
    {
      key: "1", // Табын давтагдашгүй түлхүүр
      label: "Багш дэвшүүлсэн сэдвийн жагсаалт", // Табын гарчиг
    },
    {
      key: "2",
      label: "Оюутан дэвшүүлсэн сэдвийн жагсаалт",
    },
  ];

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      {/* Хуудасны гарчиг */}
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Дэвшүүлсэн сэдвийн жагсаалт</Title>
      </header>

      {/* Хүснэгт байрлах хэсэг */}
      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          {/* Табын сонголт */}
          <Tabs
            items={items} // Табын тохиргоо
            activeKey={activeKey} // Идэвхтэй таб
            onChange={handleTabChange} // Таб солигдоход ажиллах функц
          />
          {/* Өгөгдөл ачаалж байгааг харуулах Spin */}
          <Spin spinning={loading}>
            {/* CustomTable ашиглан хүснэгт харуулах */}
            <CustomTable
              bordered // Хүснэгтэд хүрээ нэмэх
              columns={columns} // Хүснэгтийн баганууд
              dataSource={dataSource} // Өгөгдлийн эх сурвалж
              scroll={{ x: "max-content" }} // Хэвтээ гүйлгэх тохиргоо
              hasLookupField={true} // Хайлт хийх боломжтой эсэх
              onRefresh={fetchTopics} // Дахин ачаалах функц
            />
          </Spin>
          {isModalOpen && (
            // Дэлгэрэнгүй мэдээллийн цонхыг харуулах
            <TopicDetail
              isModalOpen={isModalOpen}
              data={selectedRowData}
              onClose={closeDetailModal}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ProposedTopics;
