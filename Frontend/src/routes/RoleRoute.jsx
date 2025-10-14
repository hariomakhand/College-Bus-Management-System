// routes/RoleRoute.jsx
import React from "react";
import { useAuth } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    // User login nahi hai
    return <Navigate to="/login" />;
  }

  if (user.role.toLowerCase() !== role.toLowerCase()) {
    // Role match nahi hua
    return <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Access Denied ❌</h2>
      <p>You do not have permission to view this page.</p>
    </div>;
  }

  return children;
}
