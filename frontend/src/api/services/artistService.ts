import apiClient from "../api";

export interface ArtistProfile {
  bio: string;
  location: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  created_at: string;
  profile?: ArtistProfile;
}

class AdminService {
  async getAllArtists() {
    const response = await apiClient.get("/auth/admin/artists");
    console.log(response.data);

    return response.data;
  }

  async getAllUsers() {
    const response = await apiClient.get("/auth/admin/users");
    return response.data;
  }

  /**
   * Update the status of an artist account
   * @param userId The ID of the artist
   * @param status The new status (ACTIVE, INACTIVE, PENDING)
   */
  async updateArtistStatus(
    userId: number,
    status: "ACTIVE" | "INACTIVE" | "PENDING",
  ) {
    const response = await apiClient.patch(
      `/auth/admin/artists/${userId}/status`,
      {
        status,
      },
    );
    return response.data;
  }

  /**
   * Move an artwork to the permanent Archive
   * @param artworkId The ID of the plate
   */
  async archiveArtwork(artworkId: number) {
    const response = await apiClient.patch(`/auth/admin/${artworkId}/archive`);
    return response.data;
  }

  async getArtist(id: number) {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  }
}

export default new AdminService();
