// AdminLayout.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Box sx={{ flexGrow: 1, ml: `${sidebarOpen ? 280 : 70}px`, transition: 'margin-left 0.3s ease' }}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Box sx={{ p: 3, mt: 8 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
