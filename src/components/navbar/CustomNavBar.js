import React from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from "antd";
import { BellOutlined, DownOutlined, MenuOutlined } from "@ant-design/icons";

import NotificationBell from "../notifications/NotificationBell";


const { Header } = Layout;

const CustomNavBar = ({ user, setUser, logoutFunction, onClick }) => {
  const menuItems = [
    { key: "teachers", label: "Багш, ажилтан" },
    { key: "program", label: "Хөтөлбөр" },
    { key: "lesson", label: "Хичээл" },
    { key: "schedule", label: "Хичээлийн хуваарь" },
  ];

  const signOutHandler = async () => {
    const success = await logoutFunction();
    if (success) {
      setUser(null);
    } else {
      console.error("Logout failed");
    }
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: "logout",
          label: "Гарах",
          onClick: signOutHandler,
        },
      ]}
    />
  );

  const username = user?.fnamem;

  return (
    <Header
      style={{
        background: "#f9f9fc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        height: "55px",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginRight: "24px" }}
      >
        <MenuOutlined
          style={{ fontSize: "18px", marginRight: "16px" }}
          onClick={onClick}
        />
        <img
          src="/logo.svg"
          alt="SISI Logo"
          style={{ height: "40px", width: "auto" }}
        />
        <span
          style={{
            fontSize: "24px",
            fontWeight: "500",
            marginLeft: "8px",
            color: "black",
          }}
        >
          SISi
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f9f9fc",
            height: "55px",
            fontSize: "14px",
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.key}
              style={{
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "5px",
                transition: "background-color 0.3s",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>


        {/* <NotificationBell /> -aar tur soliv */}
        {/* <div
          style={{
            backgroundColor: "white",
            borderRadius: "50%",
            padding: "7px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Badge offset={[10, 0]}>
            <BellOutlined
              style={{ fontSize: "20px", cursor: "pointer", color: "gray" }}
            />
          </Badge>
        </div> */}

        <NotificationBell />

        <div
          style={{
            width: "1px",
            height: "30px",
            backgroundColor: "#d9d9d9",
          }}
        ></div>

        <Dropdown overlay={userMenu} trigger={["click"]}>
          <Space style={{ cursor: "pointer", marginRight: "20px" }}>
            <Avatar size="middle" />
            <span style={{ fontSize: "14px" }}>{username}</span>
            <DownOutlined style={{ fontSize: "12px", color: "#333" }} />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default CustomNavBar;