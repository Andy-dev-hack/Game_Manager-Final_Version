/**
 * checkout.service.ts
 * Service for handling game purchase/checkout operations.
 * Communicates with backend payment endpoints to process game purchases.
 */

import apiClient from "../../../services/api.client";

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export const checkoutService = {
  async purchaseGames(gameIds: string[]): Promise<CheckoutResponse> {
    const { data } = await apiClient.post<CheckoutResponse>(
      "/payments/checkout/simulate",
      {
        gameIds,
      }
    );
    return data;
  },
};
