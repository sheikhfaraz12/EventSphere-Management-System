// src/pages/Exhibitor/Sidebar.jsx
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Typography,
  Divider,
  Collapse,
  Button
} from "@mui/material";
import {
  Dashboard,
  Event,
  Person,
  Map,
  FolderShared,
  Business,
  ExpandLess,
  ExpandMore,
  Logout
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const drawerWidth = 280;

const Sidebar = () => {
  const navigate = useNavigate();
  const [openRegistration, setOpenRegistration] = useState(false);
  const [openBooth, setOpenBooth] = useState(false);

  const loggedInUser = {
    name: localStorage.getItem("name") || "Exhibitor",
    email: localStorage.getItem("email") || "exhibitor@company.com",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#1e293b",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        <Toolbar>
          <Typography variant="h6" color="white">
            🎪 ExpoConnect
          </Typography>
        </Toolbar>

        <Box sx={{ px: 2, py: 1, mb: 2, borderBottom: "1px solid #334155" }}>
          <Typography variant="subtitle1" color="white">
            {loggedInUser.name}
          </Typography>
          <Typography variant="caption" color="#94a3b8">
            Exhibitor Portal
          </Typography>
        </Box>

        <List>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/customer">
              <ListItemIcon sx={{ color: "#94a3b8" }}>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ bgcolor: "#334155", my: 1 }} />

          {/* Registration & Profile Management */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenRegistration(!openRegistration)}>
              <ListItemIcon sx={{ color: "#94a3b8" }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Registration & Profile" />
              {openRegistration ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openRegistration} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton 
                  component={Link} 
                  to="/expo-register"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ color: "#94a3b8", minWidth: 40 }}>
                    <Event />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Register for Expo"
                    secondary="Company details, products, documents"
                    secondaryTypographyProps={{ sx: { color: "#94a3b8", fontSize: '0.75rem' } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton 
                  component={Link} 
                  to="/exhibitor-profile"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ color: "#94a3b8", minWidth: 40 }}>
                    <Person />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profile Management"
                    secondary="Update logos, descriptions, contact info"
                    secondaryTypographyProps={{ sx: { color: "#94a3b8", fontSize: '0.75rem' } }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Booth Management */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenBooth(!openBooth)}>
              <ListItemIcon sx={{ color: "#94a3b8" }}>
                <Map />
              </ListItemIcon>
              <ListItemText primary="Booth Management" />
              {openBooth ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openBooth} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton 
                  component={Link} 
                  to="/booth-selection"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ color: "#94a3b8", minWidth: 40 }}>
                    <Map />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Booth Selection"
                    secondary="View floor plans, select preferred spaces"
                    secondaryTypographyProps={{ sx: { color: "#94a3b8", fontSize: '0.75rem' } }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton 
                  component={Link} 
                  to="/booth-management"
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ color: "#94a3b8", minWidth: 40 }}>
                    <FolderShared />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Booth Management"
                    secondary="Manage products, staff, booth details"
                    secondaryTypographyProps={{ sx: { color: "#94a3b8", fontSize: '0.75rem' } }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ bgcolor: "#334155", my: 1 }} />

          {/* Company Info */}
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/company-info">
              <ListItemIcon sx={{ color: "#94a3b8" }}>
                <Business />
              </ListItemIcon>
              <ListItemText primary="Company Information" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
          startIcon={<Logout />}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
