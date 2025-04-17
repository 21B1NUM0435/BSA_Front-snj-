import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Button, Form, Input, Spin } from "antd";
// import { useUser } from "../context/UserContext";
import { fetchData } from "../utils";
import TextArea from "antd/es/input/TextArea";

const DraftDetail = ({ isModalOpen, data, onClose }) => {
  // const { user } = useUser();
  const [form] = Form.useForm();
  const [editableFields, setEditableFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState([]);
  const [defData, setDefData] = useState([]);

  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        setLoading(true);
        const proposalData = await fetchData("api/proposalform");
        if (proposalData && proposalData[0]) {
          setFormData(proposalData[0].fields);
          setDefData(proposalData[0].default_fields);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
  }, []);

  useEffect(() => {
    if (data?.fields && formData.length && defData.length) {
      const existingFields = JSON.parse(data.fields);

      // Combine unique fields from default_fields and fields in fetched proposal data
      const allProposalFields = [...defData, ...formData];

      const missingFields = allProposalFields.filter(
        (field) =>
          !existingFields.some(
            (existing) => existing.field === Object.keys(field)[0]
          )
      );

      // Format missing fields with default empty value
      const formattedMissingFields = missingFields.map((field) => {
        const key = Object.keys(field)[0];
        return {
          field: key,
          field2: field[key],
          value: "",
          targetUser: field.targetUser,
        };
      });

      // Combine existing and missing fields
      const combinedFields = [...existingFields, ...formattedMissingFields];
      setEditableFields(combinedFields);

      // Set initial form values
      const initialValues = combinedFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.field]: field.value || "",
        }),
        {}
      );
      form.setFieldsValue(initialValues);
    }
  }, [data, formData, defData, form]);

  const onFinish = (values) => {
    console.log("Form Submitted: ", values);
    onClose();
  };

  const saveToDraft = () => {
    const values = form.getFieldsValue();
    console.log("Saved to Draft: ", values);
    onClose();
  };

  return (
    <Modal
      title="Сэдвийн Дэлгэрэнгүй"
      open={isModalOpen}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Spin spinning={loading} tip="Loading...">
        <Form
          form={form}
          name="draftDetailForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={[24, 24]}>
            {editableFields.map((field, index) => {
              // const isRequired = field.targetUser === "All";
              const Component = field.field.includes("description")
                ? TextArea
                : Input;

              return (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Form.Item
                    label={field.field2}
                    name={field.field}
                    // rules={
                    //   isRequired
                    //     ? [
                    //         {
                    //           required: true,
                    //           message: `${field.field2} бөглөнө үү!`,
                    //         },
                    //       ]
                    //     : []
                    // }
                  >
                    <Component placeholder={`${field.field2} бөглөнө үү!`} />
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
          <Row justify="end" gutter={16} style={{ marginBottom: "16px" }}>
            <Button key="refuse" danger onClick={saveToDraft}>
              Устгах
            </Button>
            <Col>
              <Button onClick={saveToDraft}>Хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Илгээх
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default DraftDetail;
