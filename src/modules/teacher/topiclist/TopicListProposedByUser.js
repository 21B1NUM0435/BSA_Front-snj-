import React, { useState, useEffect, useCallback } from "react";
import { Spin, Tag, notification } from "antd";
import { fetchData } from "../../../utils";
import CustomTable from "../../../components/CustomTable";
import { useUser } from "../../../context/UserContext";

const TopicListProposedByUser = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [dataSource, setDataSource] = useState([]); // Data source for the table
  const [columns, setColumns] = useState([]); // Dynamic columns for the table
  const { user } = useUser(); // Get user context

  // Determine user type based on email
  const userType = user?.email === "teacher@gmail.com" ? "teacher" : "student";

  // Fetch topics based on the user's type
  const fetchTopics = useCallback(async () => {
    setLoading(true);

    try {
      // Send user type in the fetch request
      const endpoint = `topics/topiclistproposedbyuser?user_type=${userType}`;
      const rawData = await fetchData(endpoint);

      // Transform the data for the table
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
        // Dynamically generate columns based on the first item's fields
        const dynamicColumns = JSON.parse(transformedData[0].fields).map(
          (field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          })
        );

        // Add a status column
        dynamicColumns.push({
          title: "Төлөв",
          dataIndex: "status",
          key: "status",
          fixed: "right",
          filters: [
            { text: "Баталсан", value: "approved" },
            { text: "Түтгэлзүүлсэн", value: "refused" },
            { text: "Дэвшүүлсэн", value: "submitted" },
          ],
          onFilter: (value, record) => record.status === value,
          render: (status) => {
            const statusTranslations = {
              approved: { text: "Баталсан", color: "blue" },
              refused: { text: "Түтгэлзүүлсэн", color: "yellow" },
              submitted: { text: "Дэвшүүлсэн", color: "green" },
            };

            const { text, color } = statusTranslations[status] || {
              text: "Тодорхойгүй",
              color: "gray",
            };

            return <Tag color={color}>{text}</Tag>;
          },
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
  }, [userType]);

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

export default TopicListProposedByUser;
