import React, { useState, useEffect, useCallback } from "react";
import { Spin, notification, Button } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";

const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetchData("topic_requests");
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
          .filter((field) => ["name_mongolian"].includes(field.field))
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

        setColumns([
          ...dynamicColumns,
          {
            title: "Хүсэлт илгээсэн",
            dataIndex: "firstname",
            key: "firstname",
          },
          {
            title: "Хүсэлтийн тэмдэглэл",
            dataIndex: "req_note",
            key: "req_note",
          },
          {
            title: "Үйлдэл",
            key: "actions",
            fixed: "right",
            width: 150,
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="default" onClick={() => handleDetails(record)}>
                  Дэлгэрэнгүй
                </Button>
              </div>
            ),
          },
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch topics. Check console for details.",
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();

    const intervalId = setInterval(fetchTopics, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchTopics();
  };

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <CustomTable
          columns={columns}
          dataSource={dataSource}
          bordered
          scroll={{ x: "max-content" }}
          hasLookupField={true}
          onRefresh={handleRefresh}
        />
      </Spin>
      {isModalOpen && (
        <ApproveDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RequestedTopicList;
