import api from "../api";

/**
 * Interface for order creation payload
 */
interface OrderPayload {
  items: {
    artwork_id: string;
    quantity: number;
  }[];
  shipping_address: string;
}

export const OrderService = {
  // GET /api/orders
  // Returns the array of orders with nested items
  getUserOrders: async () => {
    const response = await api.get("/orders");
    return response.data.data;
  },

  // POST /api/orders
  // Initializes order and returns Stripe checkout_url
  createOrder: async (orderData: OrderPayload) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // GET /api/orders/:id
  getOrderDetails: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  cancelOrder: async (orderId: string | number) => {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // OPTIONAL: General status update if needed for the dashboard
  updateOrderStatus: async (orderId: string | number, status: string) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};
