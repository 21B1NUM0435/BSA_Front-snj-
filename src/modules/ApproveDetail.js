import React, { useEffect } from "react";
import { Modal, Row, Col, Button, message, notification } from "antd";
import { postData } from "../utils";

const ApproveDetail = ({ isModalOpen, data, onClose, onActionComplete }) => {
  useEffect(() => {
    console.log("Modal Data:", data);
  }, [data]);

  const renderFields = () => {
    if (!data?.fields) return null;

    const fieldsArray = JSON.parse(data.fields);

    const rows = [];
    for (let i = 0; i < fieldsArray.length; i += 3) {
      rows.push(fieldsArray.slice(i, i + 3));
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

  const handleAction = async (action) => {
    try {
      const payload = {
        topic_id: data.topic_id,
        req_id: data.req_id,
        student_id: data.created_by_id,
        res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
      };

      await postData("topic_confirm", payload);

      notification.success({
        message: "Амжилттай",
        description: "Сэдвийг амжилттай зөвшөөрлөө!",
      });

      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
      console.error(`Error handling topic:`, error);
      message.error("Алдаа гарлаа!");
    }
  };

  const renderFooter = () => {
    return [
      <Button key="cancel" onClick={onClose}>
        Болих
      </Button>,
      <Button
        key="confirm"
        type="primary"
        onClick={() => handleAction("submitted")}
      >
        Зөвшөөрөх
      </Button>,
    ];
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
    </Modal>
  );
};

export default ApproveDetail;
