import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import MechanicDashboard from "./MechanicDashboard";
import LoadingScreen from "./LoadingScreen";

const AppRoutes = () => {
  const { user, role, loading } = useAuth();

  console.log("DEBUG →", { user, role, loading });

  // ✅ 1. Show loading screen while checking auth state
  if (loading) return <LoadingScreen />;

  // ✅ 2. If not logged in, show login page for all routes
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ✅ 3. Logged in but no role assigned (shouldn't happen, but safe fallback)
  if (!role) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              ⚠️ No role assigned. Please contact support.
            </div>
          }
        />
      </Routes>
    );
  }

  // ✅ 4. Customer routes
  if (role === "customer") {
    return (
      <Routes>
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  }

  // ✅ 5. Mechanic routes
  if (role === "mechanic") {
    return (
      <Routes>
        <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
        <Route path="*" element={<Navigate to="/mechanic-dashboard" />} />
      </Routes>
    );
  }

  return null;
};

export default AppRoutes;
