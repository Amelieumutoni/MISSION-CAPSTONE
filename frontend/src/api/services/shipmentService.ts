import api from "../api";

export const getArtistShipments = async () => {
  const res = await api.get("/shipments/artist/all");
  return res.data;
};

export const fulfillOrder = async (
  orderId: number,
  trackingData: { tracking_number: string; carrier: string },
) => {
  // Removed the extra "/order" from the path to match your Backend Route
  const res = await api.put(`/shipments/${orderId}/fulfill`, trackingData);
  return res.data;
};

// Matches: PATCH /shipments/:order_id/deliver
export const confirmDelivery = async (orderId: number) => {
  const res = await api.patch(`/shipments/${orderId}/deliver`);
  return res.data;
};
