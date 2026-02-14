import { useEffect, useState } from "react";
import AuthService from "@/api/services/authService";

export function useAuth(requiredRole = null) {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await AuthService.getCurrentUser();
        setUser(data);

        if (requiredRole && data.role !== requiredRole) {
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [requiredRole]);

  return { user, isAuthorized, loading };
}
