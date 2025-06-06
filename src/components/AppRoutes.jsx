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

  // ✅ ONLY show loading screen if user exists and we're still fetching their profile
  if (loading && user !== null) return <LoadingScreen />;

  // ✅ No user? Show login immediately
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ✅ Logged in: route by role
  return (
    <Routes>
      {role === "customer" && (
        <>
          <Route path="/" element={<CustomerDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
      {role === "mechanic" && (
        <>
          <Route path="/" element={<MechanicDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
      {!role && (
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              ⚠️ No role assigned. Please contact support.
            </div>
          }
        />
      )}
    </Routes>
  );
};

export default AppRoutes;
