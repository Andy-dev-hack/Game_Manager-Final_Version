/**
 * orders.service.ts
 * Service for fetching user purchase history.
 */
import apiClient from "../../../services/api.client";

export interface OrderItem {
  game: string; // Game ID
  title: string;
  price: number;
  licenseKey: string;
  image?: string; // If included in backend response
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const ordersService = {
  async getMyOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>("/orders/my-orders");
    return data;
  },
};
