// @/components/protectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({
  allowedRoles,
}: {
  allowedRoles: string[];
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050508]">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. If not logged in, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Prevent loop: if already unauthorized, don't redirect again
  if (location.pathname === "/unauthorized") {
    return <Outlet />;
  }

  // 3. Check roles
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
