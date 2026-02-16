import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: ("AUTHOR" | "BUYER" | "ADMIN")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner/skeleton
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
