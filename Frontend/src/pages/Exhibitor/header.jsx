import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        height: 64,
        bgcolor: "#0f172a",
        color: "#fff",
        px: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1100,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Expo Management
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton sx={{ color: "#94a3b8", mr: 2 }}>
          <AccountCircle />
        </IconButton>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#94a3b8",
            color: "#94a3b8",
            fontWeight: 600,
          }}
          onClick={() => navigate("/login")}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Header;
