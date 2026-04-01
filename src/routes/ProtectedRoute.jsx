import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  try {
    if (userStr) {
      const user = JSON.parse(userStr);

      // optional admin-only check
      if (user?.role && user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/auth/login" replace />;
      }
    }
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;