import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Button, Input, message, notification } from "antd";
import { postData } from "../utils";
import { useUser } from "../context/UserContext";

const { TextArea } = Input;

const TopicDetail = ({ isModalOpen, data, onClose, onActionComplete }) => {
  const { user } = useUser();
  const [textAreaValue, setTextAreaValue] = useState("");

  useEffect(() => {
    // const departmentResponse = await fetchData(
    //   `department/${teacherResponse.dep_id}`
    // );
    // setDepartment(departmentResponse);
  }, [data]);

  const renderFields = () => {
    if (!data?.fields) return null;

    const fieldsArray = JSON.parse(data.fields);

    // "target_program"-ийг хасах
    const filteredFields = fieldsArray.filter(
      (field) => field.field !== "target_program"
    );

    const rows = [];
    for (let i = 0; i < filteredFields.length; i += 3) {
      rows.push(filteredFields.slice(i, i + 3));
    }

    return rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {row.map((field, colIndex) => (
          <Col key={colIndex} span={8}>
            <div>
              <strong>{field.field2}</strong>
              <div
                style={{
                  color: "#595959",
                  fontWeight: "500",
                }}
              >
                {field.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    ));
  };

  const renderPrograms = () => {
    if (!data?.program) return null;

    const programArray = JSON.parse(data.program); // Parse the string into an array
    return (
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <div>
            <strong>Зорилтот хөтөлбөр:</strong>
            <div
              style={{
                color: "#595959",
                fontWeight: "500",
                marginTop: "8px",
              }}
            >
              {programArray.join(", ")}{" "}
              {/* Display the program IDs as a comma-separated string */}
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  const handleSelection = async (userType) => {
    if (!textAreaValue.trim()) {
      message.error("Хүсэлтийн тэмдэглэлийг бөглөнө үү!");
      return;
    }
    try {
      if (userType === "teacher@gmail.com") {
        await postData("topic-requestsbyteacher", {
          topic_id: data.id,
          // student_id: user.id
          teacher_id: "1",
          note: textAreaValue,
          selection_date: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        });
      } else {
        await postData("topic-requests", {
          topic_id: data.id,
          // student_id: user.id
          student_id: "21B1NUM1961",
          note: textAreaValue,
          selection_date: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19),
        });
      }

      notification.success({
        message: "Амжилттай",
        description: "Сонгох хүсэлт илгээсэн!",
      });
      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
      console.error("Error selecting topic:", error);
      message.error("Сэдэв сонгох явцад алдаа гарлаа!");
    }
  };

  const handleAction = async (action) => {
    if (action === "refused" && !textAreaValue.trim()) {
      message.error("Хүсэлтийн тэмдэглэлийг бөглөнө үү!");
      return;
    }

    try {
      await postData("topic-response", {
        topic_id: data.id,
        supervisor_id: 1,
        res: action,
        note: textAreaValue,
        res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
      });

      notification.success({
        message: "Амжилттай",
        description:
          action === "approved"
            ? "Амжилттай баталлаа!"
            : "Амжилттай түтгэлзүүллээ!",
      });

      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
      console.error(`Error handling ${action} topic:`, error);
      message.error("Алдаа гарлаа!");
    }
  };

  const renderFooter = () => {
    if (user?.email === "supervisor@gmail.com") {
      return [
        <Button key="cancel" onClick={onClose}>
          Болих
        </Button>,
        <Button key="refuse" danger onClick={() => handleAction("refused")}>
          Түтгэлзэх
        </Button>,
        <Button
          key="approve"
          type="primary"
          onClick={() => handleAction("approved")}
        >
          Батлах
        </Button>,
      ];
      // } else if (user?.email === "teacher@gmail.com") {
      //   return [
      //     <Button key="cancel" onClick={onClose}>
      //       Болих
      //     </Button>,
      //     <Button key="confirm" type="primary">
      //       Зөвшөөрөх
      //     </Button>,
      //   ];
      // } else if (user?.email === "student@gmail.com") {
      //   return [
      //     <Button key="cancel" onClick={onClose}>
      //       Болих
      //     </Button>,
      //     <Button key="request" type="primary" onClick={handleSelection}>
      //       Сонгох
      //     </Button>,
      //   ];
      // }
    } else {
      return [
        <Button key="cancel" onClick={onClose}>
          Болих
        </Button>,
        <Button
          key="request"
          type="primary"
          // onClick={handleSelection(user?.email)}
          onClick={() => handleSelection(user?.email)}
        >
          Сонгох
        </Button>,
      ];
    }
  };

  return (
    <Modal
      title="Дэлгэрэнгүй"
      open={isModalOpen}
      onCancel={onClose}
      width={800}
      footer={renderFooter()}
    >
      {renderFields()}
      {renderPrograms()}

      <p style={{ fontWeight: "bold", marginTop: "24px" }}>
        Хүсэлтийн тэмдэглэл
      </p>
      {/* {user?.email === "teacher@gmail.com" ? (
        <p style={{ fontStyle: "italic", color: "#888" }}>Хэрэглэгч багш</p>
      ) : ( */}
      <TextArea
        rows={4}
        value={textAreaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
      />
      {/* )} */}
    </Modal>
  );
};

export default TopicDetail;
