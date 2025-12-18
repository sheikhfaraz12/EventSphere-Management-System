import React, { useState } from "react";
import Sidebar from "../Exhibitor/sidebar";
import Header from "../Exhibitor/header";

const CustomerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? 270 : 80,
          marginTop: 64,
          transition: "0.3s",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#16a34a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          🛍️ Customer Dashboard
        </h1>
      </div>
    </div>
  );
};

export default CustomerDashboard;
