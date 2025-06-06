import React from "react";
import { CircularProgress, Box } from "@mui/material";

const LoadingScreen = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

export default LoadingScreen;
