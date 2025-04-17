import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Select,
  notification,
} from "antd";
import { fetchData, postData } from "../../utils";
import TextArea from "antd/es/input/TextArea";

function SendTopic() {
  const [formData, setFormData] = useState([]);
  const [defData, setDefData] = useState([]);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const fetchProgramData = async () => {
    try {
      const data = await fetchData("api/department");
      if (data && data.length > 0) {
        const departmentPrograms = JSON.parse(data[0].programs || "[]");

        const formattedOptions = departmentPrograms.map((program) => ({
          value: program.program_id,
          label: program.program_name,
        }));

        setOptions(formattedOptions);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        const data = await fetchData("api/proposalform");
        if (data && data[0]) {
          setFormId(data[0].id);
          setFormData(data[0].fields);
          setDefData(data[0].default_fields);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
    fetchProgramData();
  }, []);

  const transformToDraftFormat = (values) => {
    const transformedData = [];

    const processDataArray = (dataArray) => {
      dataArray
        .filter((fieldObject) => {
          const targetUser = fieldObject.targetUser;
          return targetUser === "All" || targetUser === "Teacher";
        })
        .forEach((fieldObject) => {
          const firstKey = Object.keys(fieldObject)[0];
          const field2 = Object.values(fieldObject)[0];
          const targetUser = fieldObject.targetUser;

          if (values[firstKey] && firstKey !== "target_program") {
            transformedData.push({
              field: firstKey,
              field2,
              value: values[firstKey],
              targetUser,
            });
          }
        });
    };

    processDataArray(defData);
    processDataArray(formData);

    return transformedData;
  };

  const saveToDraft = async () => {
    try {
      const values = form.getFieldsValue();
      const draftData = transformToDraftFormat(values);
      const targetProgram = draftData.find(
        (field) => field.field === "target_program"
      );
      await postData("topic/storeteacher", {
        form_id: formId,
        status: "draft",
        fields: draftData,
        program: targetProgram ? targetProgram.value : [],
      });
      openNotification(
        "success",
        "Draft Saved",
        "Ноорогт амжилттай хадгаллаа."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error saving draft:", error);
      openNotification(
        "error",
        "Save Failed",
        "Ноорог хадгалах явцад алдаа гарлаа."
      );
    }
  };

  const onFinish = async (values) => {
    try {
      const submitData = transformToDraftFormat(values);
      const targetProgram = submitData.find(
        (field) => field.field === "target_program"
      );
      await postData("topic/storeteacher", {
        form_id: formId,
        status: "submitted",
        fields: submitData,
        program: targetProgram ? targetProgram.value : [],
      });
      console.log(submitData);
      openNotification(
        "success",
        "Submission Successful",
        "Амжилттай сэдэв дэвшүүллээ."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      openNotification(
        "error",
        "Submission Failed",
        "Сэдэв дэвшүүлэх явцад алдаа гарлаа."
      );
    }
  };

  const handleSelectChange = (value, option) => {
    if (value.includes("all")) {
      // Select all options when "Бүгд" is selected
      const allOptionValues = options.map((opt) => opt.value);
      form.setFieldsValue({ target_program: allOptionValues });
    } else {
      form.setFieldsValue({ target_program: value });
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Spin spinning={loading} tip="Loading...">
        <Form
          form={form}
          name="proposeTopicForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row
            justify="end"
            gutter={16}
            style={{ marginBottom: "16px", marginTop: "16px" }}
          >
            <Col>
              <Button onClick={saveToDraft}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Илгээх
              </Button>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: "16px" }}>
            {defData
              .filter((fieldObject) => {
                const targetUser = fieldObject.targetUser;
                return targetUser === "All" || targetUser === "Teacher";
              })
              .map((fieldObject, index) => {
                const firstKey = Object.keys(fieldObject)[0];
                const firstValue = Object.values(fieldObject)[0];

                return (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8} key={index}>
                    {firstKey === "target_program" ? (
                      <Form.Item
                        label={firstValue}
                        name={firstKey}
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Нэмэлт талбарыг бөглөнө үү!",
                        //   },
                        // ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Зорилтот хөтөлбөр сонгоно уу"
                          // style={{
                          //   width: "100%",
                          // }}
                          onChange={handleSelectChange}
                          options={[
                            { value: "all", label: "Бүгд" },
                            ...options,
                          ]}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label={firstValue}
                        name={firstKey}
                        rules={[
                          {
                            required: true,
                            message: `${firstValue} бөглөнө үү!`,
                          },
                        ]}
                      >
                        <Input placeholder={`${firstValue} бөглөнө үү!`} />
                      </Form.Item>
                    )}
                  </Col>
                );
              })}

            {formData
              .filter((fieldObject) => {
                const targetUser = fieldObject.targetUser;
                return targetUser === "All" || targetUser === "Teacher";
              })
              .map((fieldObject, index) => {
                const firstKey = Object.keys(fieldObject)[0];
                const firstValue = Object.values(fieldObject)[0];
                return (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                    xl={8}
                    key={`form-${index}`}
                  >
                    <Form.Item label={firstValue} name={firstKey}>
                      <TextArea placeholder={`${firstValue} бөглөнө үү!`} />
                    </Form.Item>
                  </Col>
                );
              })}
          </Row>
        </Form>
      </Spin>
    </div>
  );
}

export default SendTopic;
