import React, { useState, useEffect } from "react";
import { Layout, Spin, notification, Typography, Tag } from "antd";
import { fetchData } from "../../utils";
import CustomTable from "../../components/CustomTable";
import { Content } from "antd/lib/layout/layout";

const { Title } = Typography;

const StudentList = () => {
  const [loading, setLoading] = useState(true); // Өгөгдөл ачаалж байгаа эсэхийг заана
  const [dataSource, setDataSource] = useState([]); // Оюутнуудын өгөгдлийг хадгалах

  // Хүснэгтийн багануудын тохиргоо
  const columns = [
    {
      title: "SISI ID", // SISI ID багана
      dataIndex: "sisi_id", // Өгөгдлийн түлхүүр
      key: "id",
    },
    {
      title: "Нэр", // Оюутны нэрийг харуулах багана
      dataIndex: "firstname",
      key: "name",
    },
    {
      title: "Овог", // Оюутны овгийг харуулах багана
      dataIndex: "lastname",
      key: "lname",
    },
    {
      title: "Хөтөлбөр", // Оюутны хөтөлбөрийг харуулах багана
      dataIndex: "program",
      key: "program",
    },
    {
      title: "Сэдэв сонгосон эсэх", // Сэдэв сонгосон эсэхийг харуулах багана
      dataIndex: "is_choosed",
      key: "is_choosed",
      filters: [
        { text: "Тийм", value: true }, // Тийм сонголтын шүүлт
        { text: "Үгүй", value: false }, // Үгүй сонголтын шүүлт
      ],
      onFilter: (value, record) => record.is_choosed === value, // Сонгосон утгаас хамаарч шүүх функц
      render: (is_choosed) => (
        <Tag color={is_choosed ? "green" : "yellow"}>
          {is_choosed ? "Тийм" : "Үгүй"}
        </Tag>
      ), // Сэдэв сонгосон эсэхийг өнгө болон текстээр харуулах
    },
    {
      title: "Цахим хаяг", // Оюутны цахим хаяг
      dataIndex: "mail",
      key: "mail",
    },
    {
      title: "Утасны дугаар", // Оюутны утасны дугаар
      dataIndex: "phone",
      key: "phone",
    },
  ];

  // Серверээс оюутнуудын өгөгдлийг татах функц
  const fetchStudents = async () => {
    try {
      const rawData = await fetchData("students/all"); // Сервер рүү хүсэлт илгээх
      if (!rawData.length) throw new Error("No data returned"); // Өгөгдөл байхгүй үед алдаа шидэх

      setDataSource(rawData); // Өгөгдлийг хүснэгтэд дамжуулах
      setLoading(false); // Ачаалал дууссан
    } catch (error) {
      console.error("Error fetching students:", error); // Алдааг консолд хэвлэх
      notification.error({
        message: "Алдаа", // Алдааны мэдэгдлийн гарчиг
        description: "Оюутнуудын мэдээллийг татахад алдаа гарлаа.", // Алдааны дэлгэрэнгүй мэдээлэл
      });
      setLoading(false); // Ачаалал дууссан
    }
  };

  useEffect(() => {
    fetchStudents(); // Компонент анх ачаалагдах үед өгөгдөл татах
  }, []); // Зөвхөн анхны ачаалалд ажиллана

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      {/* Хуудасны гарчиг */}
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Оюутны Жагсаалт</Title>
      </header>

      {/* Хүснэгт байрлах хэсэг */}
      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          <div className="p-4">
            {/* Өгөгдөл ачаалж байгааг харуулах Spin */}
            <Spin spinning={loading}>
              <CustomTable
                columns={columns} // Хүснэгтийн баганууд
                dataSource={dataSource} // Хүснэгтийн өгөгдөл
                bordered // Хүрээтэй хүснэгт
                scroll={{ x: "max-content" }} // Хэвтээ гүйлгэх тохиргоо
                hasLookupField={true} // Хайлт хийх боломжтой эсэхийг тодорхойлох
                onRefresh={fetchStudents} // Дахин ачаалах функц
              />
            </Spin>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default StudentList;
