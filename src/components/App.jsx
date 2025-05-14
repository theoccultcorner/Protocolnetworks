// src/components/App.jsx

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import MechanicDashboard from "./MechanicDashboard";
import CustomerProfileView from "./CustomerProfileView";
import {
  Box,
  Typography,
  CircularProgress,
  Button
} from "@mui/material";
import { auth, signOut } from "../firebase";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

const App = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      console.log("User logged out");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) return <Login />;

  if (!role) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading your dashboard...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          If this takes too long, make sure your user role is set in Firestore.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ p: 2, textAlign: "right" }}>
        <Button onClick={handleLogout} variant="outlined" color="secondary">
          Logout
        </Button>
      </Box>

      <Routes>
        {/* Customer dashboard */}
        {role === "customer" && (
          <>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* Mechanic dashboard and profile viewing */}
        {role === "mechanic" && (
          <>
            <Route path="/" element={<MechanicDashboard />} />
            <Route path="/customer/:id" element={<CustomerProfileView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Box>
  );
};

export default App;
