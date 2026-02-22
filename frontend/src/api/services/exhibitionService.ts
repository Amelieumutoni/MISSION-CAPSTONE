import api from "../api";

export interface Artwork {
  artwork_id: string;
  title: string;
  main_image: string;
  price?: number;
}

export interface LiveDetails {
  stream_status: "IDLE" | "STREAMING" | "DISCONNECTED"; // Updated to match your backend ENUM
  current_viewers: number;
  artist_peer_id?: string;
}

export interface Exhibition {
  exhibition_id: string;
  author_id: string;
  title: string;
  description: string;
  type: "CLASSIFICATION" | "LIVE";
  status: "UPCOMING" | "LIVE" | "ARCHIVED";
  stream_link?: string;
  banner_image: string;
  is_published: boolean;
  start_date: string;
  end_date: string;
  artworks?: Artwork[];
  live_details?: LiveDetails;
}

export const ExhibitionService = {
  /**
   * Create a new exhibition (Uses FormData for the banner image)
   */

  updateExhibition: async (exhibitionId: string, formData: FormData) => {
    const response = await api.patch(`/exhibitions/${exhibitionId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  createExhibition: async (formData: FormData) => {
    const response = await api.post("/exhibitions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Get all exhibitions belonging to the logged-in author
   * (Includes drafts/unpublished ones)
   */
  getMyExhibitions: async (): Promise<{
    success: boolean;
    data: Exhibition[];
  }> => {
    const response = await api.get("/exhibitions/my-exhibitions");
    return response.data;
  },

  /**
   * Update the status (UPCOMING, LIVE, ARCHIVED)
   */
  updateStatus: async (exhibitionId: string, is_published: boolean) => {
    const response = await api.patch(
      `/exhibitions/${exhibitionId}/visibility`,
      { is_published },
    );
    return response.data;
  },

  /**
   * Replace/Set the entire array of artworks for the exhibition
   */
  assignArtworks: async (exhibitionId: string, artworkIds: string[]) => {
    const response = await api.put(`/exhibitions/${exhibitionId}/artwork`, {
      artworkIds,
    });
    return response.data;
  },

  /**
   * Append specific artworks to an existing exhibition list
   */
  // addArtworks: async (exhibitionId: string, artworkIds: string[]) => {
  //   const response = await api.post(`/exhibitions/${exhibitionId}/artwork`, {
  //     artworkIds,
  //   });
  //   return response.data;
  // },

  /**
   * Start a live stream by sending the PeerJS ID
   */
  startLiveStream: async (exhibitionId: string, peerId: string) => {
    const response = await api.post(
      `/exhibitions/${exhibitionId}/start-stream`,
      { peerId },
    );
    return response.data;
  },

  endLiveStream: async (exhibitionId: string) => {
    const response = await api.post(`/exhibitions/${exhibitionId}/end-stream`);
    return response.data;
  },
  /**
   * Upload recording file after stream ends
   */

  uploadRecording: async (exhibitionId: string, file: File) => {
    const formData = new FormData();
    formData.append("recording", file);
    formData.append("exhibitionId", exhibitionId);

    const response = await api.post(
      `/exhibitions/recordings/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
  /**
   * Get all public exhibitions (only is_published: true)
   */
  getPublicExhibitions: async (params?: { status?: string; type?: string }) => {
    const response = await api.get("/exhibitions/public", { params });
    return response.data;
  },

  /**
   * Get details for a single public exhibition
   */
  getExhibitionById: async (
    exhibitionId: string,
  ): Promise<{ success: boolean; data: Exhibition }> => {
    const response = await api.get(`/exhibitions/public/${exhibitionId}`);
    return response.data;
  },

  getExhibitionByIdByMe: async (
    exhibitionId: string,
  ): Promise<{ success: boolean; data: Exhibition }> => {
    console.log(exhibitionId);
    const response = await api.get(
      `/exhibitions/my-exhibitions/${exhibitionId}`,
    );
    return response.data;
  },

  getAdminExhibitions: async (): Promise<{
    success: boolean;
    data: Exhibition;
  }> => {
    const response = await api.get(`/exhibitions/all`);
    return response.data;
  },
};
