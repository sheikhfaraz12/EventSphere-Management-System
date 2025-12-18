import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  Collapse,
  Toolbar,
  Typography
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const [openExpo, setOpenExpo] = useState(false);
  const [openExhibitors, setOpenExhibitors] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openAnalytics, setOpenAnalytics] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
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
      <Box sx={{ padding: 2 }}>
        <Toolbar>
          <Typography variant="h6" color="white">
            🎪 Event Management
          </Typography>
        </Toolbar>

        <Box sx={{ px: 2, py: 1, mb: 2, borderBottom: "1px solid #334155" }}>
          <Typography variant="subtitle1" color="white">
            {loggedInUser.name || "Unknown User"}
          </Typography>
        </Box>

        <List>
          {/* Expo Management */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenExpo(!openExpo)}>
              <ListItemText primary="Expo Management" />
              {openExpo ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openExpo} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/create-expo")}>
                  <ListItemText primary="Create Expo" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/edit-expo")}>
                  <ListItemText primary="Edit Expo" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/expo-list")}>
                  <ListItemText primary="View Expo List" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Exhibitor Management */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenExhibitors(!openExhibitors)}>
              <ListItemText primary="Exhibitor Management" />
              {openExhibitors ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openExhibitors} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/exhibitor-list")}>
                  <ListItemText primary="View Exhibitors" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/approve-exhibitor")}>
                  <ListItemText primary="Approve Exhibitors" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Schedule Management */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenSchedule(!openSchedule)}>
              <ListItemText primary="Schedule Management" />
              {openSchedule ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openSchedule} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/create-schedule")}>
                  <ListItemText primary="Create Schedule" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/schedule-list")}>
                  <ListItemText primary="View Schedule" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>

          {/* Analytics */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenAnalytics(!openAnalytics)}>
              <ListItemText primary="Analytics & Reporting" />
              {openAnalytics ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openAnalytics} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem disablePadding sx={{ pl: 4 }}>
                <ListItemButton onClick={() => navigate("/analytics-dashboard")}>
                  <ListItemText primary="View Analytics" />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ padding: 2 }}>
        <Button variant="contained" color="error" fullWidth onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
