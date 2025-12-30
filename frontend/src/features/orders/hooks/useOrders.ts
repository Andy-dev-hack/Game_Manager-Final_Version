/**
 * useOrders.ts
 * Hook to fetch user orders.
 */
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../services/orders.service";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: ordersService.getMyOrders,
  });
};
