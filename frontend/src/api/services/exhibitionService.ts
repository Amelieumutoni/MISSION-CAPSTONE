import api from "../api";

export interface Exhibition {
  exhibition_id: string;
  title: string;
  description: string;
  type: "CLASSIFICATION" | "LIVE";
  stream_link?: string;
  banner_image?: string;
  is_published: boolean;
  start_date?: string;
  end_date?: string;
  artworks?: [];
}

export const ExhibitionService = {
  createExhibition: async (formData: FormData) => {
    const response = await api.post("/exhibitions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  toggleVisibility: async (exhibitionId: string, isPublished: boolean) => {
    const response = await api.patch(`/${exhibitionId}/visibility`, {
      is_published: isPublished,
    });
    return response.data;
  },

  assignArtworks: async (exhibitionId: string, artworkIds: string[]) => {
    const response = await api.put(`/${exhibitionId}/artworks`, {
      artworkIds,
    });
    return response.data;
  },

  getPublicExhibitions: async () => {
    const response = await api.get("/exhibitions/public");
    return response.data;
  },

  getExhibitionById: async (exhibitionId: string) => {
    const response = await api.get(`/exhibitions/public/${exhibitionId}`);
    return response.data;
  },
};
