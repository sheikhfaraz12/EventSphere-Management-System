// Header.jsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Badge,
  alpha,
} from '@mui/material';
import { Menu as MenuIcon, Mail, Notifications, ArrowDropDown } from '@mui/icons-material';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ name: 'Admin User', role: 'Administrator' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const colors = {
    primary: '#667eea',
    secondary: '#764ba2',
    cardBg: '#1e293b',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      sx={{
        ml: sidebarOpen ? '280px' : '70px',
        width: `calc(100% - ${sidebarOpen ? 280 : 70}px)`,
        backgroundColor: colors.cardBg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        zIndex: 1200,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            ExpoFlow
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: colors.textSecondary }}>
            <Badge badgeContent={2} color="error">
              <Mail />
            </Badge>
          </IconButton>
          <IconButton sx={{ color: colors.textSecondary }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1, borderRadius: 1, '&:hover': { backgroundColor: alpha(colors.primary, 0.1) } }}
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ bgcolor: colors.primary, width: 32, height: 32, fontSize: 14 }}>{user.name?.charAt(0)}</Avatar>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2" sx={{ color: colors.textPrimary }}>{user.name}</Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>{user.role}</Typography>
            </Box>
            <ArrowDropDown sx={{ color: colors.textSecondary }} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ sx: { backgroundColor: colors.cardBg, mt: 1.5, minWidth: 200 } }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
