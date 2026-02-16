import type { AuthResponse, RegisterPayload } from "@/types/auth";
import apiClient from "../api";
import { ENDPOINTS } from "../endpoints";

const AuthService = {
  // login service
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    localStorage.setItem("user_data", JSON.stringify(response.data.user));
    return response.data;
  },

  // register service
  async register(userData: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      userData,
    );

    // If your backend returns a token immediately after registration
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  },

  // getting current user
  async getCurrentUser() {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async updateProfile(formData: FormData) {
    const response = await apiClient.patch(ENDPOINTS.ARTIST.PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.user) {
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("cart");

    window.location.replace("/login");
  },
};

export default AuthService;
