import React, { useState, useEffect } from "react";
// import { Layout, Spin, Row, Col } from "antd";
import { Spin, Row, Col } from "antd";
import Title from "antd/es/typography/Title";
// import { Content } from "antd/es/layout/layout";
import { fetchData } from "../../utils";

const ConfirmedTopic = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [department, setDepartment] = useState(null);
  const [matchedPrograms, setMatchedPrograms] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Fetch topic data
        const topicResponse = await fetchData("topic_confirmed");
        if (topicResponse && topicResponse.data.length > 0) {
          const topicData = topicResponse.data[0];
          setData(topicData);

          // Fetch teacher who created the topic
          const teacherResponse = await fetchData(
            `teacher/${topicData.created_by_id}`
          );
          setTeacher(teacherResponse);

          // Fetch department associated with the teacher
          const departmentResponse = await fetchData(
            `department/${teacherResponse.dep_id}`
          );
          setDepartment(departmentResponse);

          // Match programs
          const topicPrograms = JSON.parse(topicData.program);
          const departmentPrograms = JSON.parse(departmentResponse.programs);

          // Find matching programs
          const matched = departmentPrograms.filter((program) =>
            topicPrograms.includes(program.program_id)
          );

          setMatchedPrograms(matched.map((program) => program.program_name));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const renderFields = () => {
    if (!data?.fields) return null;

    const fieldsArray = JSON.parse(data.fields);

    // Filter out the "target_program" field
    const filteredFields = fieldsArray.filter(
      (field) => field.field !== "target_program"
    );

    const rows = [];
    for (let i = 0; i < filteredFields.length; i += 3) {
      rows.push(filteredFields.slice(i, i + 3));
    }

    return (
      <>
        {rows.map((row, rowIndex) => (
          <Row
            key={rowIndex}
            gutter={[16, 16]}
            style={{ marginBottom: "16px" }}
          >
            {row.map((field, colIndex) => (
              <Col key={colIndex} span={8}>
                <div>
                  <strong>{field.field2}</strong>
                  <div
                    style={{
                      color: "#595959",
                      fontWeight: "500",
                    }}
                  >
                    {field.value}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ))}
        {/* Display only program names under Зорилтот хөтөлбөр */}
        {matchedPrograms.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
            <Col span={24}>
              <div>
                <strong>Зорилтот хөтөлбөр</strong>
                <div
                  style={{
                    color: "#595959",
                    fontWeight: "500",
                  }}
                >
                  {matchedPrograms.join(", ")}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      {/* <header style={{ textAlign: "left" }}>
        <Title level={3}>Сонгосон сэдэв</Title>
      </header>

      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}> */}
      {loading ? (
        <Spin />
      ) : data ? (
        <>
          <Title level={4}>Сэдвийн мэдээлэл</Title>
          {renderFields()}
          <Title level={4}>Бусад мэдээлэл</Title>
          {teacher && (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                <Col span={8}>
                  <strong>Удирдагч багш:</strong>{" "}
                  {`${teacher.lastname.charAt(0)}. ${teacher.firstname}`}
                </Col>
                <Col span={8}>
                  <strong>Цахим хаяг:</strong> {teacher.mail}
                </Col>
                {department && (
                  <>
                    <Col span={8}>
                      <strong>Тэнхимийн нэр:</strong> {department.name}
                    </Col>
                  </>
                )}
              </Row>
            </>
          )}
        </>
      ) : (
        <div>Мэдээлэл олдсонгүй.</div>
      )}
      {/* </Content>
      </Layout> */}
    </div>
  );
};

export default ConfirmedTopic;
