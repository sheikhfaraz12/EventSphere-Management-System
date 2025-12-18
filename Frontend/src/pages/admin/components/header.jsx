import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const drawerWidth = 240;

export default function Header() {
  return (
    <AppBar
      position="fixed"
      sx={{ ml: `${drawerWidth}px`, background: "#0f172a" }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
