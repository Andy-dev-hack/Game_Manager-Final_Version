import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutService } from "../services/checkout.service";
import { useNavigate } from "react-router-dom";

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: checkoutService.purchaseGames,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      navigate("/library");
    },
  });
};
