import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import AuthService from "@/api/services/authService";

type User = {
  id: string;
  role: "AUTHOR" | "BUYER" | "ADMIN";
  email: string;
  name?: string;
  profile?: { profile_picture?: string };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isFetching = useRef(false);

  const refreshUser = useCallback(async () => {
    if (isFetching.current) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    isFetching.current = true;
    try {
      const data = await AuthService.getCurrentUser();
      setUser(data);
      setIsAuthenticated(true);
    } catch (err) {
      AuthService.logout(); // clears token and user_data
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Listen for token invalidation events from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      // Only act if we currently think we're authenticated
      if (isAuthenticated) {
        logout();
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [isAuthenticated, logout]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      logout,
      refreshUser,
    }),
    [user, loading, isAuthenticated, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
