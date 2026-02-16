import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized: Clear session and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
    } else if (status === 403) {
      toast.error("Forbidden", {
        description: "You don't have permission for this.",
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
