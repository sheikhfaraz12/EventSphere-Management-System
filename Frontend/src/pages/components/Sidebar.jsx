// Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  Event,
  People,
  Schedule,
  Analytics,
  Settings,
  Help,
  Logout,
  Add,
  Edit,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const Sidebar = ({ open, toggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const colors = {
    sidebarBg: '#1e1e2f',
    primary: '#667eea',
    secondary: '#764ba2',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    hoverBg: 'rgba(102,126,234,0.1)',
  };

  const [expoOpen, setExpoOpen] = useState(false);
  const [exhibitorOpen, setExhibitorOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },

    {
      text: 'Expo Management',
      icon: <Event />,
      subItems: [
        { text: 'View Expo', icon: <Edit />, path: '/viewexpo' },   // FIXED PATH
        { text: 'Add Expo', icon: <Add />, path: '/addexpo' },      // FIXED PATH
      ],
    },

    {
      text: 'Exhibitor Management',
      icon: <People />,
      subItems: [
        { text: 'View Registrations', icon: <People />, path: '/exhibitors' },
        { text: 'Approve/Reject Applications', icon: <Edit />, path: '/exhibitorapproval' },
        { text: 'Booth Assignment', icon: <Schedule />, path: '/Boothassignment' },
      ],
    },

    {
      text: 'Schedule Management',
      icon: <Schedule />,
      subItems: [
        { text: 'Create Schedule', icon: <Add />, path: '/schedule/create' },
        { text: 'Edit Sessions', icon: <Edit />, path: '/schedule/edit' },
        { text: 'Speaker Assignment', icon: <People />, path: '/schedule/speaker' },
      ],
    },

    { text: 'Analytics & Reporting', icon: <Analytics />, path: '/analytics' },
  ];

  const bottomItems = [
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Help & Support', icon: <Help />, path: '/help' },
    { text: 'Logout', icon: <Logout />, path: '/logout' },
  ];

  const handleClick = (text) => {
    if (text === 'Expo Management') setExpoOpen(!expoOpen);
    if (text === 'Exhibitor Management') setExhibitorOpen(!exhibitorOpen);
    if (text === 'Schedule Management') setScheduleOpen(!scheduleOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          ExpoFlow Admin
        </Typography>
      </Box>

      <Divider sx={{ borderColor: alpha(colors.textPrimary, 0.1) }} />

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <ListItemButton
              onClick={() => item.subItems ? handleClick(item.text) : navigate(item.path)}
              sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: colors.hoverBg } }}
            >
              <ListItemIcon sx={{ color: colors.textSecondary }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ sx: { color: colors.textPrimary } }} />
              {item.subItems &&
                ((item.text === 'Expo Management' && expoOpen) ||
                (item.text === 'Exhibitor Management' && exhibitorOpen) ||
                (item.text === 'Schedule Management' && scheduleOpen) ? (
                  <ExpandLess sx={{ color: colors.textSecondary }} />
                ) : (
                  <ExpandMore sx={{ color: colors.textSecondary }} />
                ))}
            </ListItemButton>

            {item.subItems && (
              <Collapse
                in={
                  (item.text === 'Expo Management' && expoOpen) ||
                  (item.text === 'Exhibitor Management' && exhibitorOpen) ||
                  (item.text === 'Schedule Management' && scheduleOpen)
                }
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((sub) => (
                    <ListItemButton
                      key={sub.text}
                      onClick={() => navigate(sub.path)}
                      sx={{
                        pl: 6,
                        borderRadius: 2,
                        mb: 0.5,
                        '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
                      }}
                    >
                      <ListItemIcon sx={{ color: colors.textSecondary }}>{sub.icon}</ListItemIcon>
                      <ListItemText
                        primary={sub.text}
                        primaryTypographyProps={{ sx: { color: colors.textSecondary } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Divider sx={{ borderColor: alpha(colors.textPrimary, 0.1) }} />

      <List sx={{ p: 2 }}>
        {bottomItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: colors.hoverBg } }}
          >
            <ListItemIcon sx={{ color: colors.textSecondary }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ sx: { color: colors.textPrimary } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggleSidebar}
          PaperProps={{ sx: { backgroundColor: colors.sidebarBg, width: 280, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          PaperProps={{
            sx: {
              backgroundColor: colors.sidebarBg,
              width: open ? 280 : 70,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              border: 'none',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
