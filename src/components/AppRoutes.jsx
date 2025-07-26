import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import MechanicDashboard from "./MechanicDashboard";
import LoadingScreen from "./LoadingScreen";

// Only mechanic account
const MECHANIC_EMAIL = "protocolnetwork18052687686@gmail.com";

// Assign role based on email
const assignRole = (email) =>
  email?.trim().toLowerCase() === MECHANIC_EMAIL ? "mechanic" : "customer";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) return <LoadingScreen />;

  // Not logged in — show login for any route
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Debug print to confirm correct user
  console.log("🔍 Logged in as:", user.email);

  const role = assignRole(user.email);
  console.log("🧠 Assigned role:", role);

  // Mechanic route
  if (role === "mechanic") {
    return (
      <Routes>
        <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
        <Route path="*" element={<Navigate to="/mechanic-dashboard" />} />
      </Routes>
    );
  }

  // Default to customer
  return (
    <Routes>
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
