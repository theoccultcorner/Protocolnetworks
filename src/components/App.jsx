import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import MechanicDashboard from "./MechanicDashboard";
import LoadingScreen from "./LoadingScreen";

// Define the only mechanic email
const MECHANIC_EMAIL = "protocolnetwork18052687686@gmail.com";

// Force role assignment based on email
const assignRole = (email) =>
  email?.trim().toLowerCase() === MECHANIC_EMAIL ? "mechanic" : "customer";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const role = assignRole(user.email); // ✅ always determine role based on email

  // Customer routes
  if (role === "customer") {
    return (
      <Routes>
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  }

  // Mechanic routes
  if (role === "mechanic") {
    return (
      <Routes>
        <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
        <Route path="*" element={<Navigate to="/mechanic-dashboard" />} />
      </Routes>
    );
  }

  // Should never happen
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      ❌ Unknown user role. Please contact support.
    </div>
  );
};

export default AppRoutes;
