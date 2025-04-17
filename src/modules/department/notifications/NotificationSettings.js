import React, { useState, useEffect } from 'react';
import { 
  Form, Switch, Card, Button, InputNumber, 
  DatePicker, Select, Space, notification, Spin, Tabs,
  Collapse, Radio, Divider, Typography 
} from 'antd';
import { fetchData, postData } from '../../../utils';

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

function NotificationSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetchData('notification-settings');
      if (response && response.success && response.data) {
        setSettings(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch notification settings.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetchData('notification-templates');
      if (response && response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await postData('notification-settings', values);
      if (response && response.success) {
        notification.success({
          message: 'Success',
          description: 'Notification settings updated successfully.'
        });
        setSettings(values);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update notification settings.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTemplatesByType = (type) => {
    return templates.filter(t => t.event_type === type || !t.event_type);
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          auto_notifications_enabled: true,
          deadline_reminder_days: [14, 7, 3, 1],
          topic_approval_template_id: null,
          deadline_reminder_template_id: null,
          evaluation_template_id: null
        }}
      >
        <Card title="Automatic Notifications" bordered={false}>
          <Form.Item
            name="auto_notifications_enabled"
            valuePropName="checked"
          >
            <Space align="baseline">
              <Switch />
              <span>Enable automatic notifications</span>
            </Space>
          </Form.Item>

          <Collapse defaultActiveKey={['1', '2', '3']}>
            <Panel header="Topic Approval Notifications" key="1">
              <Form.Item
                name="topic_approval_enabled"
                valuePropName="checked"
                label="Send notification when a topic is approved"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="topic_approval_template_id"
                label="Default template"
                dependencies={['topic_approval_enabled']}
              >
                <Select
                  placeholder="Select a template"
                  disabled={!form.getFieldValue('topic_approval_enabled')}
                >
                  {filterTemplatesByType('topic_approval').map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Panel>

            <Panel header="Deadline Reminder Notifications" key="2">
              <Form.Item
                name="deadline_reminders_enabled"
                valuePropName="checked"
                label="Send notifications for upcoming deadlines"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Send reminders before deadline"
                name="deadline_reminder_days"
                dependencies={['deadline_reminders_enabled']}
              >
                <Select
                  mode="multiple"
                  placeholder="Select days before deadline"
                  disabled={!form.getFieldValue('deadline_reminders_enabled')}
                >
                  <Option value={1}>1 day before</Option>
                  <Option value={3}>3 days before</Option>
                  <Option value={7}>1 week before</Option>
                  <Option value={14}>2 weeks before</Option>
                  <Option value={30}>1 month before</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="deadline_reminder_template_id"
                label="Default template"
                dependencies={['deadline_reminders_enabled']}
              >
                <Select
                  placeholder="Select a template"
                  disabled={!form.getFieldValue('deadline_reminders_enabled')}
                >
                  {filterTemplatesByType('deadline_reminder').map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Panel>

            <Panel header="Evaluation Notifications" key="3">
              <Form.Item
                name="evaluation_notifications_enabled"
                valuePropName="checked"
                label="Send notification when an evaluation is submitted"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="evaluation_template_id"
                label="Default template"
                dependencies={['evaluation_notifications_enabled']}
              >
                <Select
                  placeholder="Select a template"
                  disabled={!form.getFieldValue('evaluation_notifications_enabled')}
                >
                  {filterTemplatesByType('evaluation_notification').map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Panel>
          </Collapse>
        </Card>

        <Card title="Deadlines" className="mt-4" bordered={false}>
          <Text>Set the deadlines for important thesis milestones. These will be used for automatic reminders.</Text>
          
          <Form.Item
            name="thesis_proposal_deadline"
            label="Thesis Proposal Submission"
            className="mt-4"
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="first_draft_deadline"
            label="First Draft Submission"
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="final_submission_deadline"
            label="Final Thesis Submission"
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
        </Card>

        <Form.Item className="mt-4">
          <Button type="primary" htmlType="submit" size="large">
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}

export default NotificationSettings;