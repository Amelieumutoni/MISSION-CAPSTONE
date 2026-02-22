import api from "../api";

export const livekitToken = async (exhibitionId: number, role: string) => {
  const res = await api.post("/livekit/token", { exhibitionId, role });
  return res.data;
};
