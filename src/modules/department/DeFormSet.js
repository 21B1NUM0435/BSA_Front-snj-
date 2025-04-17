import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
  Table,
  notification,
  Layout,
  Typography,
} from "antd";
import { fetchData, postData } from "../../utils";

const { Content } = Layout;
const { Title } = Typography;

// EditableContext нь мөр болон нүдний өгөгдлийг удирдах зориулалттай
const EditableContext = React.createContext(null);

// Мөрийн өгөгдлийг засварлах боломжтой EditableRow компонент
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// Нүдний өгөгдлийг засварлах боломжтой EditableCell компонент
const EditableCell = ({
  title,
  editable, // Засварлах боломжтой эсэхийг тодорхойлох
  children, // Эх өгөгдөл
  dataIndex,
  record,
  handleSave, // Засварласны дараа хадгалах функц
  ...restProps
}) => {
  const [editing, setEditing] = useState(false); // Засварлаж байгаа эсэхийг заана
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus(); // Засварлаж эхлэх үед анхаарал төвлөрүүлэх
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing); // Засварлах горимыг өөрчлөх
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields(); // Нүдний утгыг шалгах
      toggleEdit(); // Засварлах горимыг хаах
      handleSave({ ...record, ...values }); // Засварласан утгыг хадгалах
    } catch (errInfo) {
      console.log("Save failed:", errInfo); // Алдаа гарсан үед хэвлэх
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save} // Enter дарсан үед хадгалах
          onBlur={save} // Фокус алдагдсан үед хадгалах
          className="focus:outline-none"
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap px-3 py-1 cursor-pointer"
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return (
    <td className="editable-cell relative" {...restProps}>
      {childNode}
    </td>
  );
};

// EditableTable компонент - Хүснэгтийн өгөгдлийг засварлах боломжтой болгох
const EditableTable = () => {
  const [dataSource, setDataSource] = useState([]); // Хүснэгтийн өгөгдөл хадгалах
  const [, setCount] = useState(0); // Мөр нэмэхэд ашиглах тооллын утга
  const [originalData, setOriginalData] = useState(null); // Эх өгөгдөл хадгалах
  const [loading, setLoading] = useState(true); // Ачаалж байгаа төлөв
  const [defaultFields, setDefaultFields] = useState({}); // Тогтмол талбаруудын өгөгдөл

  // Серверээс өгөгдөл татах функц
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetchData("proposalform"); // Серверээс өгөгдөл татах
      if (res.length > 0) {
        const fieldsData = res[0].fields.map((item, index) => {
          const englishField = Object.keys(item)[0];
          const mongolianField = item[englishField];
          return {
            key: `row-${index}`,
            mongolianField,
            englishField,
            targetUser: item.targetUser || "All",
          };
        });

        setDataSource(fieldsData); // Хүснэгтийн өгөгдлийг тохируулах
        setOriginalData(res[0]); // Эх өгөгдлийг хадгалах
        setDefaultFields(res[0].default_fields); // Тогтмол талбаруудыг тохируулах
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false); // Ачаалал дууссан
    }
  };

  useEffect(() => {
    fetchPosts(); // Анхны ачааллын үед өгөгдөл татах
  }, []);

  // Мөр устгах функц
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key); // Устгах мөрийг хасах
    setDataSource(newData);
  };

  // Мөр нэмэх функц
  const handleAdd = () => {
    setCount((prevCount) => {
      const newRow = {
        key: `new-${Date.now()}`,
        mongolianField: "Шинэ талбар",
        englishField: "new_field",
        targetUser: "Бүгд",
      };
      setDataSource((prevDataSource) => [...prevDataSource, newRow]); // Шинэ мөр нэмэх
      return prevCount + 1;
    });
  };

  // Засварласан мөрийг хадгалах функц
  const handleSave = (row) => {
    setDataSource((prevDataSource) =>
      prevDataSource.map((item) =>
        item.key === row.key ? { ...item, ...row } : item
      )
    );
  };

  // Серверт өгөгдлийг хадгалах функц
  const handleSaveToDatabase = async () => {
    if (!originalData) return;

    const updatedFields = dataSource.map(
      ({ mongolianField, englishField, targetUser }) => ({
        [englishField]: mongolianField,
        targetUser,
      })
    );

    const updatedData = {
      ...originalData,
      fields: updatedFields,
    };

    try {
      await postData("proposalform", updatedData, "post"); // Сервер рүү өгөгдөл илгээх
      notification.success({
        message: "Амжилттай",
        description: "Талбаруудыг амжилттай хадгаллаа.",
        placement: "topRight",
        duration: 3,
      });
      fetchPosts(); // Шинэчилсэн өгөгдлийг татах
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Талбар хадгалахад алдаа гарлаа.",
        placement: "topRight",
        duration: 3,
      });
    }
  };

  const components = {
    body: {
      row: EditableRow, // Засварлах боломжтой мөр
      cell: EditableCell, // Засварлах боломжтой нүд
    },
  };

  // Хүснэгтийн багануудын тохиргоо
  const columns = [
    {
      title: "Монгол талбар",
      dataIndex: "mongolianField",
      key: "mongolianField",
      editable: true, // Засварлах боломжтой
    },
    {
      title: "English Field",
      dataIndex: "englishField",
      key: "englishField",
      editable: true,
    },
    {
      title: "Зорилтот хэрэглэгч",
      dataIndex: "targetUser",
      render: (_, record) => {
        return (
          <Select
            defaultValue={record.targetUser}
            style={{ width: 150 }}
            options={[
              { value: "All", label: "Бүгд" },
              { value: "Student", label: "Оюутан" },
              { value: "Teacher", label: "Багш" },
            ]}
            onChange={(value) => {
              handleSave({ ...record, targetUser: value });
            }}
          />
        );
      },
    },
    {
      title: "Үйлдэл",
      dataIndex: "operation",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Устгах уу?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button danger>Устгах</Button>
          </Popconfirm>
        ) : null,
    },
  ].map((col) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave,
    }),
  }));

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        {/* Тогтмол талбаруудыг харуулах хэсэг */}
        <div style={{ marginBottom: "24px" }}>
          <Card
            title={
              <span style={{ fontWeight: "normal" }}>Тогтмол талбарууд</span>
            }
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Array.isArray(defaultFields) &&
                defaultFields.map((fieldObject, index) => {
                  const firstValue = Object.values(fieldObject)[0];
                  return (
                    <div
                      key={index}
                      style={{
                        width: "24%",
                        textAlign: "center",
                      }}
                    >
                      {firstValue}
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        {/* Хүснэгтийн товчнууд */}
        <div className="flex justify-between mb-4">
          <Button onClick={handleAdd} type="default">
            Талбар нэмэх
          </Button>
          <Button onClick={handleSaveToDatabase} type="primary">
            Хадгалах
          </Button>
        </div>

        {/* Хүснэгтийг харуулах */}
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </Spin>
    </div>
  );
};

const DeFormSet = () => {
  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Сэдэв дэвшүүлэх хэлбэр</Title>
      </header>

      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          <EditableTable />
        </Content>
      </Layout>
    </div>
  );
};

export default DeFormSet;
