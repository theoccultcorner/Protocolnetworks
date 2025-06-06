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

  // ✅ Wait for Firebase to finish checking login state
  if (loading) return <LoadingScreen />;

  // ✅ If no user is signed in
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ✅ If user is logged in, route by role
  if (role === "customer") {
    return (
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (role === "mechanic") {
    return (
      <Routes>
        <Route path="/" element={<MechanicDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // ✅ If user is logged in but role is not assigned yet
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
};

export default AppRoutes;
