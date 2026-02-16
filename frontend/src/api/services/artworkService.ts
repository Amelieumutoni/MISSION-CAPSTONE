import apiClient from "../api";

/**
 * Service to handle all Artwork and Media related API calls.
 */
const ArtworkService = {
  /**
   * CREATE ARTWORK (Author only)
   * Expects FormData containing: title, description, technique, materials,
   * dimensions, creation_year, price, stock_quantity, and main_image (file)
   */
  createArtwork: async (formData: FormData) => {
    const response = await apiClient.post("/artworks", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * GET MY ARTWORKS (Author only)
   * Fetches artworks created by the logged-in author
   */
  getMyArtworks: async () => {
    const response = await apiClient.get("/artworks/me");
    return response.data;
  },

  /**
   * GET ALL ARTWORKS (Public)
   */
  getArtworks: async () => {
    const response = await apiClient.get("/artworks");
    return response.data;
  },

  /**
   * GET ARTWORK BY ID
   */
  getArtworkById: async (artworkId: number) => {
    const response = await apiClient.get(`/artworks/${artworkId}`);
    return response.data;
  },

  /**
   * UPDATE ARTWORK (Author only)
   * Supports partial updates via FormData (including main_image)
   */
  updateArtwork: async (artworkId: number, formData: FormData) => {
    const response = await apiClient.patch(`/artworks/${artworkId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * ARCHIVE ARTWORK (Author only)
   */
  archiveArtwork: async (artworkId: number) => {
    const response = await apiClient.patch(`/artworks/${artworkId}/archive`);
    return response.data;
  },

  /**
   * BULK UPLOAD MEDIA
   * Expects FormData with key 'media' containing multiple files
   */
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

  /**
   * GET ARTWORK MEDIA
   */
  getArtworkMedia: async (artworkId: number) => {
    const response = await apiClient.get(`/artworks/${artworkId}/media`);
    return response.data;
  },

  /**
   * SET PRIMARY MEDIA
   */
  setPrimaryMedia: async (mediaId: number) => {
    const response = await apiClient.patch(
      `/artworks/media/${mediaId}/primary`,
    );
    return response.data;
  },

  /**
   * DELETE MEDIA
   */
  deleteMedia: async (mediaId: number) => {
    const response = await apiClient.delete(`/artworks/media/${mediaId}`);
    return response.data;
  },
};

export default ArtworkService;
