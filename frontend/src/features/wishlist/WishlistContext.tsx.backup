/**
 * WishlistContext.tsx
 * Context provider for managing user's wishlist.
 * Handles adding, removing, and checking items in the wishlist with backend persistence.
 */
import { createContext, useContext } from "react";
import { type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import {
  addToWishlist as addToWishlistApi,
  getWishlist,
  removeFromWishlist as removeFromWishlistApi,
} from "../../services/user.service";
import type { Game } from "../../services/games.service";

export interface WishlistContextType {
  wishlist: Game[];
  addToWishlist: (game: Game) => Promise<void>;
  removeFromWishlist: (gameId: string) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
  isLoading: boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query for fetching wishlist
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for adding to wishlist
  const addMutation = useMutation({
    mutationFn: (game: Game) => addToWishlistApi(game._id),
    onMutate: async (game) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist =
        queryClient.getQueryData<Game[]>(["wishlist"]) || [];

      // Optimistic add
      queryClient.setQueryData<Game[]>(["wishlist"], (old) => [
        ...(old || []),
        game,
      ]);

      return { previousWishlist };
    },
    onError: (_err, _game, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error("Failed to add to wishlist");
    },
    onSuccess: () => {
      toast.success("Added to wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  // Mutation for removing from wishlist
  const removeMutation = useMutation({
    mutationFn: (gameId: string) => removeFromWishlistApi(gameId),
    onMutate: async (gameId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist =
        queryClient.getQueryData<Game[]>(["wishlist"]) || [];

      // Optimistic remove
      queryClient.setQueryData<Game[]>(["wishlist"], (old) =>
        (old || []).filter((g) => g._id !== gameId)
      );

      return { previousWishlist };
    },
    onError: (_err, _gameId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      toast.error("Failed to remove from wishlist");
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const addToWishlist = async (game: Game) => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      return;
    }
    addMutation.mutate(game);
  };

  const removeFromWishlist = async (gameId: string) => {
    if (!isAuthenticated) return;
    removeMutation.mutate(gameId);
  };

  const isInWishlist = (gameId: string) => {
    return (
      Array.isArray(wishlist) && wishlist.some((item) => item._id === gameId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
