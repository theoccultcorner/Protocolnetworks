// src/components/Layout.jsx
import React from "react";
import { Box, AppBar, Toolbar, Typography, Container } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafc" }}>
      <AppBar position="static" sx={{ bgcolor: "#1f2937" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ color: "#fff", flexGrow: 1 }}>
            Protocol Networks
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>{children}</Container>
    </Box>
  );
};

export default Layout;

