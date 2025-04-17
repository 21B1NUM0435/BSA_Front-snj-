import React, { useState, useEffect, useCallback } from "react";
import { Spin, Button, notification, message, Popconfirm } from "antd";
import { fetchData, postData } from "../../utils";
import CustomTable from "../../components/CustomTable";

const ConfirmedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchData("topics_confirmed");
      const rawData = response.data;

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        try {
          const fieldsArray = JSON.parse(item.fields);
          const fieldsObject = fieldsArray.reduce(
            (acc, field) => ({
              ...acc,
              [field.field]: field.value,
              [`${field.field}_name`]: field.field2,
            }),
            {}
          );
          return { ...item, ...fieldsObject, key: item.id };
        } catch (error) {
          console.error("Error parsing fields:", item.fields, error);
          return { ...item, key: item.id };
        }
      });

      setDataSource(transformedData);

      if (rawData[0]?.fields) {
        const fieldsArray = JSON.parse(rawData[0].fields);
        const dynamicColumns = fieldsArray
          .filter((field) =>
            ["name_mongolian", "name_english"].includes(field.field)
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

        setColumns([
          ...dynamicColumns,
          {
            title: "Сонгосон оюутан",
            key: "fullname",
            render: (_, record) => {
              const firstLetterOfLastName = record.lastname?.charAt(0) || "";
              return `${firstLetterOfLastName}.${record.firstname}`;
            },
          },
          {
            title: "Сиси ID",
            dataIndex: "sisi_id",
            key: "sisi_id",
          },
          {
            title: "Үйлдэл",
            key: "actions",
            fixed: "right",
            width: 150,
            render: (_, record) => (
              <Popconfirm
                title="Та цуцлахдаа итгэлтэй байна уу?"
                onConfirm={() => handleAction(record)}
                onCancel={() => console.log("Cancelled!")}
                okText="Тийм"
                cancelText="Үгүй"
              >
                <Button type="default">Цуцлах</Button>
              </Popconfirm>
            ),
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch topics. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleAction = useCallback(
    async (data) => {

      try {
        const payload = {
          topic_id: data.topic_id,
          req_id: data.req_id,
          student_id: data.created_by_id,
          res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        };

        await postData("topic_decline", payload);

        notification.success({
          message: "Амжилттай",
          description: "Сэдвийг амжилттай цуцаллаа!",
        });

        fetchTopics();
      } catch (error) {
        console.error(`Error handling topic:`, error);
        message.error("Алдаа гарлаа!");
      }
    },
    [fetchTopics]
  );

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <CustomTable
          bordered
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: "max-content" }}
          hasLookupField={true}
          onRefresh={fetchTopics}
        />
      </Spin>
    </div>
  );
};

export default ConfirmedTopicList;
