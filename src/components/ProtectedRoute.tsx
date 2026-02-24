import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
