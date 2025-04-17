import React, { useState, useEffect, useCallback } from "react";
import { Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";

const CheckedTopicList = ({ active }) => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    if (!active) return;

    setLoading(true);
    try {
      const rawData = await fetchData("topics/checkedtopics");
      const transformedData = rawData.map((item) => {
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
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
        const dynamicColumns = JSON.parse(transformedData[0].fields)
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(
              field.field
            )
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

        dynamicColumns.push({
          title: "Үйлдэл",
          key: "actions",
          fixed: "right",
          width: 150,
          render: (_, record) => (
            <Button type="default" onClick={() => handleDetails(record)}>
              Дэлгэрэнгүй
            </Button>
          ),
        });

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch topics. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    let intervalId;
    if (active) {
      fetchTopics();
      intervalId = setInterval(fetchTopics, 5000);
    }
    return () => clearInterval(intervalId);
  }, [active, fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsModalOpen(false);
  };

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
      {isModalOpen && (
        <TopicDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default CheckedTopicList;
