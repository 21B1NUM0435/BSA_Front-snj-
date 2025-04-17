import { Button } from "antd";
import React from "react";

const CustomButton = ({ children, onClick }) => {
  const styles = {
    button: {
      backgroundColor: "#e0d8f9", // Light purple background
      color: "#6f32ff", // Purple text
      border: "none",
      padding: "10px 20px", // Proper padding to fit content
      fontSize: "16px",
      borderRadius: "8px", // Rounded corners
      display: "inline-block", // Prevent shrinking
      cursor: "pointer",
      transition: "all 0.3s ease", // Smooth transition
      lineHeight: "1", // Ensures no extra line height issues
    },
    hover: {
      backgroundColor: "#6f32ff", // Dark purple background
      color: "white", // White text
    },
  };

  return (
    <Button
      onClick={onClick}
      style={styles.button}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = styles.hover.backgroundColor;
        e.target.style.color = styles.hover.color;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = styles.button.backgroundColor;
        e.target.style.color = styles.button.color;
      }}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
