import apiClient from "../api";

export interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  created_at: string;
  profile?: {
    bio: string;
    location: string;
    profile_picture?: string; // Added to match your previous UI implementation
  };
}

// New Interface for Orders
export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  // Add other fields based on your backend response
}

class AdminService {
  /* --- User & Artist Management --- */

  async getAllArtists() {
    const response = await apiClient.get<{
      success: boolean;
      count: number;
      data: UserProfile[];
    }>("/auth/admin/artists");
    return response.data;
  }

  async getAllUsers() {
    const response = await apiClient.get<{
      success: boolean;
      data: UserProfile[];
    }>("/auth/admin/users");
    return response.data;
  }

  async updateArtistStatus(userId: number, status: string) {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { userId: number; status: string };
    }>(`/auth/admin/artists/${userId}/status`, { status });
    return response.data;
  }

  /* --- Order Management (New) --- */

  /**
   * Fetches all orders in the system (Admin only)
   */
  async getAllOrders() {
    const response = await apiClient.get<{
      success: boolean;
      data: Order[];
    }>("/orders/all");
    return response.data;
  }

  /**
   * Fetches specific order details by ID
   * Accessible by ADMIN and the BUYER who owns the order
   */
  async getOrderDetails(orderId: number) {
    const response = await apiClient.get<{
      success: boolean;
      data: Order;
    }>(`/orders/${orderId}`);
    return response.data;
  }
}

export default new AdminService();
