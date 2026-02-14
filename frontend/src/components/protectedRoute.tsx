import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: ("AUTHOR" | "BUYER" | "ADMIN")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user_data");

  // Basic check: is the data even there?
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user: { role: "AUTHOR" | "BUYER" | "ADMIN" } | null = null;
  let isCorrupted = false;

  try {
    user = JSON.parse(userStr);
  } catch {
    isCorrupted = true;
    localStorage.clear();
  }

  if (isCorrupted) {
    return <Navigate to="/login" replace />;
  }

  // Authorization Check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
