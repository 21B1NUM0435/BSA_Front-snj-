import React, { useState, useEffect } from "react";
import { 
  Table, Button, Space, Modal, Form, Input, Select, 
  notification, Spin, Tabs, Card, Popconfirm
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CopyOutlined, ExclamationCircleOutlined 
} from "@ant-design/icons";
import { fetchData, postData } from "../../../utils";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

function NotificationTemplates() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, duplicate
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetchData("notification-templates");
      if (response && response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch notification templates."
      });
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    setModalMode("create");
    setCurrentTemplate(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (template) => {
    setModalMode("edit");
    setCurrentTemplate(template);
    form.setFieldsValue({
      name: template.name,
      subject: template.subject,
      body: template.body,
      event_type: template.event_type || null
    });
    setIsModalVisible(true);
  };

  const showDuplicateModal = (template) => {
    setModalMode("duplicate");
    setCurrentTemplate(template);
    form.setFieldsValue({
      name: `Copy of ${template.name}`,
      subject: template.subject,
      body: template.body,
      event_type: template.event_type || null
    });
    setIsModalVisible(true);
  };

  const handleDelete = (template) => {
    confirm({
      title: "Are you sure you want to delete this template?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "No",
      onOk() {
        deleteTemplate(template.id);
      }
    });
  };

  const deleteTemplate = async (id) => {
    setLoading(true);
    try {
      const response = await fetchData(`notification-templates/${id}`, {}, "delete");
      if (response && response.success) {
        notification.success({
          message: "Success",
          description: "Template deleted successfully."
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      notification.error({
        message: "Error",
        description: "Failed to delete template."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(values => {
        if (modalMode === "edit") {
          updateTemplate(values);
        } else {
          createTemplate(values);
        }
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  };

  const createTemplate = async (values) => {
    setLoading(true);
    try {
      const response = await postData("notification-templates", values);
      if (response && response.success) {
        notification.success({
          message: "Success",
          description: "Template created successfully."
        });
        setIsModalVisible(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error creating template:", error);
      notification.error({
        message: "Error",
        description: "Failed to create template."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (values) => {
    setLoading(true);
    try {
      const response = await postData(`notification-templates/${currentTemplate.id}`, values, "put");
      if (response && response.success) {
        notification.success({
          message: "Success",
          description: "Template updated successfully."
        });
        setIsModalVisible(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error updating template:", error);
      notification.error({
        message: "Error",
        description: "Failed to update template."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const getFilteredTemplates = () => {
    if (activeTab === "all") {
      return templates;
    }
    return templates.filter(template => template.event_type === activeTab);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Event Type",
      dataIndex: "event_type",
      key: "event_type",
      render: eventType => eventType || "Manual",
      filters: [
        { text: "Manual", value: null },
        { text: "Topic Approval", value: "topic_approval" },
        { text: "Deadline Reminder", value: "deadline_reminder" },
        { text: "Evaluation", value: "evaluation_notification" }
      ],
      onFilter: (value, record) => {
        if (value === null) {
          return record.event_type === null || record.event_type === "";
        }
        return record.event_type === value;
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, template) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(template)}
            type="primary"
            size="small"
          />
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => showDuplicateModal(template)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this template?"
            onConfirm={() => deleteTemplate(template.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="mb-4 flex justify-between">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="All Templates" key="all" />
          <TabPane tab="Topic Approval" key="topic_approval" />
          <TabPane tab="Deadline Reminders" key="deadline_reminder" />
          <TabPane tab="Evaluations" key="evaluation_notification" />
        </Tabs>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Create Template
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={getFilteredTemplates()}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          modalMode === "create" 
            ? "Create Template" 
            : modalMode === "edit" 
              ? "Edit Template" 
              : "Duplicate Template"
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true, message: "Please enter template name" }]}
          >
            <Input placeholder="Template name" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Subject" />
          </Form.Item>

          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: "Please enter body content" }]}
          >
            <TextArea
              rows={10}
              placeholder="Body content"
            />
          </Form.Item>

          <Form.Item
            name="event_type"
            label="Event Type"
          >
            <Select placeholder="Select an event type" allowClear>
              <Option value="topic_approval">Topic Approval</Option>
              <Option value="deadline_reminder">Deadline Reminder</Option>
              <Option value="evaluation_notification">Evaluation</Option>
            </Select>
          </Form.Item>

          <Card title="Available Variables" size="small">
            <Tabs defaultActiveKey="1">
            <TabPane tab="General" key="1">
              <ul className="list-disc pl-5">
                <li><code>{'{{student_name}}'}</code> - Student's first name</li>
                <li><code>{'{{submission_deadline}}'}</code> - Final submission deadline</li>
              </ul>
            </TabPane>
            <TabPane tab="Topic" key="2">
              <ul className="list-disc pl-5">
                <li><code>{'{{topic_name_mon}}'}</code> - Topic name in Mongolian</li>
                <li><code>{'{{topic_name_eng}}'}</code> - Topic name in English</li>
                <li><code>{'{{approval_date}}'}</code> - Date of approval</li>
                <li><code>{'{{supervisor_name}}'}</code> - Supervisor's name</li>
              </ul>
            </TabPane>
            <TabPane tab="Deadlines" key="3">
              <ul className="list-disc pl-5">
                <li><code>{'{{deadline_type}}'}</code> - Type of deadline</li>
                <li><code>{'{{due_date}}'}</code> - Due date</li>
                <li><code>{'{{days_remaining}}'}</code> - Days remaining</li>
                <li><code>{'{{requirements}}'}</code> - Requirements for deadline</li>
              </ul>
            </TabPane>
            <TabPane tab="Evaluation" key="4">
              <ul className="list-disc pl-5">
                <li><code>{'{{evaluation_type}}'}</code> - Type of evaluation</li>
                <li><code>{'{{score}}'}</code> - Score or grade</li>
                <li><code>{'{{feedback}}'}</code> - Feedback text</li>
                <li><code>{'{{improvement_areas}}'}</code> - Areas for improvement</li>
                <li><code>{'{{next_steps}}'}</code> - Next steps for student</li>
              </ul>
            </TabPane>
            </Tabs>
          </Card>
        </Form>
      </Modal>
    </Spin>
  );
}

export default NotificationTemplates;