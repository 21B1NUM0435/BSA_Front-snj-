import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, DatePicker, notification, Spin, Card, Row, Col, Tabs } from "antd";
import { fetchData, postData } from "../../../utils";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function NotificationComposer() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [preview, setPreview] = useState({
    subject: "",
    content: ""
  });
  const [recipientFilter, setRecipientFilter] = useState("all");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetchData("notification-templates");
        if (response && response.data) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch notification templates."
        });
      }
    };

    const fetchStudents = async () => {
      try {
        const data = await fetchData("students/all");
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch students."
        });
      }
    };

    fetchTemplates();
    fetchStudents();
  }, []);

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.setFieldsValue({
        subject: template.subject,
        content: template.body
      });
      updatePreview(template.subject, template.body, form.getFieldValue("data") || {});
    }
  };

  const handleContentChange = (e) => {
    updatePreview(
      form.getFieldValue("subject"),
      e.target.value,
      form.getFieldValue("data") || {}
    );
  };

  const handleSubjectChange = (e) => {
    updatePreview(
      e.target.value,
      form.getFieldValue("content"),
      form.getFieldValue("data") || {}
    );
  };

  const updatePreview = (subject, content, data) => {
    // Simple placeholder replacement for preview
    let previewSubject = subject || "";
    let previewContent = content || "";

    // Replace placeholders with data values or placeholder text
    Object.keys(data || {}).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewSubject = previewSubject.replace(regex, data[key]);
      previewContent = previewContent.replace(regex, data[key]);
    });

    // For placeholders without data, show them in a different style
    previewSubject = previewSubject.replace(/{{(\w+)}}/g, '<span style="color: #ff4d4f">[[$1]]</span>');
    previewContent = previewContent.replace(/{{(\w+)}}/g, '<span style="color: #ff4d4f">[[$1]]</span>');

    setPreview({
      subject: previewSubject,
      content: previewContent
    });
  };

  const getFilteredRecipients = () => {
    switch(recipientFilter) {
      case "confirmed":
        return students.filter(student => student.is_choosed);
      case "unconfirmed":
        return students.filter(student => !student.is_choosed);
      default:
        return students;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Determine recipients based on selection
      let selectedRecipients = [];
      
      if (values.sendToAll) {
        // Send to all based on filter
        selectedRecipients = getFilteredRecipients().map(student => ({
          id: student.id,
          email: student.mail,
          data: {
            student_name: student.firstname,
            // Add other student-specific data
          }
        }));
      } else if (values.recipients && values.recipients.length > 0) {
        // Send to selected recipients
        selectedRecipients = values.recipients.map(id => {
          const student = students.find(s => s.id === id);
          return {
            id: student.id,
            email: student.mail,
            data: {
              student_name: student.firstname,
              // Add other student-specific data
            }
          };
        });
      } else {
        notification.error({
          message: "Error",
          description: "Please select at least one recipient or choose to send to all."
        });
        setLoading(false);
        return;
      }

      // Prepare template or direct data
      let apiEndpoint, requestData;
      
      if (values.template_id) {
        // Using a template
        apiEndpoint = "notifications/template";
        requestData = {
          template_id: values.template_id,
          recipients: selectedRecipients,
          data: values.data || {},
          schedule: values.schedule ? values.schedule.format() : null,
          url: values.url
        };
      } else {
        // Using direct content
        apiEndpoint = "notifications";
        requestData = {
          recipients: selectedRecipients,
          title: values.subject,
          content: values.content,
          schedule: values.schedule ? values.schedule.format() : null,
          url: values.url,
          send_email: true,
          send_push: true
        };
      }

      const response = await postData(apiEndpoint, requestData);

      notification.success({
        message: "Success",
        description: "Notification sent successfully!"
      });

      form.resetFields();
      setPreview({ subject: "", content: "" });
    } catch (error) {
      console.error("Error sending notification:", error);
      notification.error({
        message: "Error",
        description: "Failed to send notification."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Card title="Notification Content" bordered={false}>
              <Form.Item
                label="Template"
                name="template_id"
              >
                <Select 
                  placeholder="Select a template" 
                  onChange={handleTemplateChange}
                  allowClear
                  >
                  {templates.map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: "Please enter a subject" }]}
              >
                <Input 
                  placeholder="Notification subject" 
                  onChange={handleSubjectChange}
                />
              </Form.Item>

              <Form.Item
                label="Content"
                name="content"
                rules={[{ required: true, message: "Please enter notification content" }]}
              >
                <TextArea 
                  rows={8} 
                  placeholder="Notification content"
                  onChange={handleContentChange}
                />
              </Form.Item>

              <Form.Item
                label="Dynamic Data"
                name="data"
              >
                <Card size="small" title="Variable Values (Optional)">
                  <p className="text-gray-500 mb-2 text-sm">
                    Enter values for placeholders in your template or content.
                  </p>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name={["data", "submission_deadline"]}>
                        <Input placeholder="submission_deadline" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={["data", "days_remaining"]}>
                        <Input placeholder="days_remaining" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name={["data", "deadline_type"]}>
                        <Input placeholder="deadline_type" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name={["data", "due_date"]}>
                        <Input placeholder="due_date" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form.Item>

              <Form.Item
                label="URL (Optional)"
                name="url"
              >
                <Input placeholder="Link to include in notification" />
              </Form.Item>

              <Form.Item
                label="Schedule (Optional)"
                name="schedule"
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Select time to send notification"
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Recipients" bordered={false}>
              <Form.Item name="sendToAll" valuePropName="checked">
                <div className="mb-4">
                  <Tabs defaultActiveKey="all" onChange={setRecipientFilter}>
                    <TabPane tab="All Students" key="all" />
                    <TabPane tab="With Confirmed Topics" key="confirmed" />
                    <TabPane tab="Without Confirmed Topics" key="unconfirmed" />
                  </Tabs>
                  <Button 
                    type="primary" 
                    onClick={() => form.setFieldsValue({ sendToAll: true, recipients: [] })}
                    className="mt-2"
                  >
                    {`Send to All ${getFilteredRecipients().length} Students`}
                  </Button>
                </div>
              </Form.Item>

              <div className="mb-2 font-medium">Or select specific recipients:</div>
              <Form.Item
                name="recipients"
              >
                <Select
                  mode="multiple"
                  placeholder="Select recipients"
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  showSearch
                  onSelect={() => form.setFieldsValue({ sendToAll: false })}
                >
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.lastname} {student.firstname} ({student.program})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

            <Card title="Preview" bordered={false} className="mt-4">
              <div className="mb-2 font-medium">Subject:</div>
              <div 
                className="mb-4 p-2 border rounded bg-gray-50"
                dangerouslySetInnerHTML={{ __html: preview.subject }}
              />
              
              <div className="mb-2 font-medium">Content:</div>
              <div 
                className="p-2 border rounded bg-gray-50 whitespace-pre-wrap"
                style={{ maxHeight: '200px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </Card>
          </Col>
        </Row>

        <Form.Item className="mt-4">
          <Button type="primary" htmlType="submit" size="large">
            Send Notification
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}

export default NotificationComposer;