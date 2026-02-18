import apiClient from "../api";

const ArtworkService = {
  createArtwork: async (formData: FormData) => {
    const response = await apiClient.post("/artworks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getMyArtworks: async () => {
    const response = await apiClient.get("/artworks/me");
    return response.data;
  },

  /**
   * GET ALL ARTWORKS (Public)
   * Filters out artworks from authors who are not ACTIVE.
   */
  getArtworks: async () => {
    const response = await apiClient.get("/artworks");

    // Check if the structure has .data.data (common in paginated NestJS/Express apps)
    // or just .data (standard Axios)
    const rawList = Array.isArray(response.data)
      ? response.data
      : response.data?.data;

    if (Array.isArray(rawList)) {
      const filteredList = rawList.filter(
        (work: any) => work.author?.status === "ACTIVE",
      );

      // Return the same structure the UI expects, but with the filtered list
      return Array.isArray(response.data)
        ? filteredList
        : { ...response.data, data: filteredList };
    }

    return response.data;
  },

  getArtworkById: async (artworkId: number) => {
    const response = await apiClient.get(`/artworks/${artworkId}`);
    return response.data;
  },

  updateArtwork: async (artworkId: number, formData: FormData) => {
    const response = await apiClient.patch(`/artworks/${artworkId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  archiveArtwork: async (artworkId: number) => {
    const response = await apiClient.patch(`/artworks/${artworkId}/archive`);
    return response.data;
  },

  // ... (Other media methods remain unchanged)
  bulkUploadMedia: async (artworkId: number, formData: FormData) => {
    const response = await apiClient.post(
      `/artworks/${artworkId}/media`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getArtworkMedia: async (artworkId: number) => {
    const response = await apiClient.get(`/artworks/${artworkId}/media`);
    return response.data;
  },

  setPrimaryMedia: async (mediaId: number) => {
    const response = await apiClient.patch(
      `/artworks/media/${mediaId}/primary`,
    );
    return response.data;
  },

  deleteMedia: async (mediaId: number) => {
    const response = await apiClient.delete(`/artworks/media/${mediaId}`);
    return response.data;
  },
};

export default ArtworkService;
