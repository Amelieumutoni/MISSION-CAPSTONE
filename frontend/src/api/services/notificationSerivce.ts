import apiClient from "../api";

const NotificationService = {
  /**
   * Fetch all notifications for the current user.
   */
  getMyNotifications: async () => {
    const response = await apiClient.get("/notifications");
    return response.data;
  },

  /**
   * Fetch only high-priority alerts (Admin only).
   */
  getAdminAlerts: async () => {
    const response = await apiClient.get("/notifications/admin-alerts");
    return response.data;
  },

  /**
   * Mark a specific notification as read.
   */
  markAsRead: async (notificationId: number) => {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  /**
   * Bulk update: Mark all notifications as read.
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  },

  /**
   * Delete a notification from the archive.
   */
  deleteNotification: async (notificationId: number) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default NotificationService;
