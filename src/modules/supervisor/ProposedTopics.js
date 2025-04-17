import React, { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Tabs, Spin, Button, notification, Alert } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";
import { safeParseJSON } from "../../utils";

const { Content } = Layout;
const { Title } = Typography;

const ProposedTopics = () => {
  const [activeKey, setActiveKey] = useState("1"); // Идэвхтэй табын түлхүүр хадгалах
  const [loading, setLoading] = useState(false); // Өгөгдөл ачаалж байгаа эсэхийг заах
  const [dataSource, setDataSource] = useState([]); // Хүснэгтийн өгөгдлийг хадгалах
  const [columns, setColumns] = useState([]); // Хүснэгтийн багануудыг хадгалах
  const [isModalOpen, setIsModalOpen] = useState(false); // Дэлгэрэнгүй цонх нээлттэй эсэхийг заах
  const [selectedRowData, setSelectedRowData] = useState(null); // Сонгосон мөрний өгөгдлийг хадгалах
  const [error, setError] = useState(null);

  // Таб солигдох үед идэвхтэй табын түлхүүрийг шинэчлэх
  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`); // Шинэ табын түлхүүрийг консолд хэвлэх
  };

  // Сэдвүүдийг серверээс татах функц - include loading in dependencies
  const fetchTopics = useCallback(async () => {
    if (loading) return; // Skip if already loading
    
    setLoading(true); // Ачаалал эхэлснийг заах
    setError(null);

    try {
      const type = activeKey === "1" ? "teacher" : "student"; // Табын түлхүүрээс хамааран төрөл тодорхойлох
      const endpoint = `topics/submittedby/${type}`; // Тохирох API endpoint-ыг ашиглах
      
      // Add a timeout to avoid waiting forever
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      );
      
      const fetchPromise = fetchData(endpoint);
      const rawData = await Promise.race([fetchPromise, timeoutPromise]);

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        try {
          // Handle fields safely
          const fieldsArray = safeParseJSON(item.fields, []);
          const fieldsObject = fieldsArray.reduce(
            (acc, field) => ({
              ...acc,
              [field.field]: field.value,
              [`${field.field}_name`]: field.field2,
            }),
            {}
          );
          return { ...item, ...fieldsObject, key: item.id, type };
        } catch (err) {
          console.warn('Error processing topic fields:', err);
          return { ...item, key: item.id, type };
        }
      });

      setDataSource(transformedData); // Хүснэгтийн өгөгдлийг шинэчлэх

      if (transformedData.length > 0 && transformedData[0].fields) {
        try {
          // Хүснэгтийн баганы тохиргоо хийх
          const fieldsData = safeParseJSON(transformedData[0].fields, []);
          const dynamicColumns = fieldsData
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
        } catch (err) {
          console.error("Error setting up columns:", err);
          setError("Хүснэгтийн багана тохируулахад алдаа гарлаа");
        }
      } else if (transformedData.length === 0) {
        // Handle empty data
        setColumns([
          {
            title: "Монгол нэр",
            key: "name_mongolian",
            dataIndex: "name_mongolian"
          },
          {
            title: "Англи нэр",
            key: "name_english",
            dataIndex: "name_english"
          },
          {
            title: "Тайлбар",
            key: "description",
            dataIndex: "description"
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      setError(`Өгөгдөл татахад алдаа гарлаа: ${error.message}`);
      
      notification.error({
        message: "Алдаа",
        description: "Сэдвийн жагсаалт татахад алдаа гарлаа.",
      });
    } finally {
      setLoading(false); // Ачаалал дууссаныг заах
    }
  }, [activeKey, loading]); // Include loading in dependencies

  // Анхны ачааллын үед болон таб солигдох үед өгөгдөл татах
  useEffect(() => {
    fetchTopics();
    
    // Set up polling but with safeguards
    let isMounted = true;
    const intervalId = setInterval(() => {
      if (isMounted && !loading) {
        fetchTopics();
      }
    }, 5000); // 5 seconds

    return () => {
      isMounted = false;
      clearInterval(intervalId); // Interval-ийг цэвэрлэх
    };
  }, [fetchTopics, loading]); // Include loading in dependencies

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
          
          {/* Show error if there is one */}
          {error && (
            <Alert
              message="Алдаа"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" onClick={fetchTopics}>
                  Дахин оролдох
                </Button>
              }
            />
          )}
          
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
              onActionComplete={fetchTopics}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ProposedTopics;