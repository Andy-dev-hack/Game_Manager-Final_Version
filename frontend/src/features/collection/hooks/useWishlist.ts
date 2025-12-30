/**
 * useWishlist.ts
 * Custom hook for managing user's wishlist.
 * Provides query for fetching wishlist and mutations for adding/removing games.
 * Automatically invalidates cache on mutations for instant UI updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionService } from "../services/collection.service";
import { useAuth } from "../../auth/AuthContext";

/**
 * useWishlist hook
 * Manages user's game wishlist with add/remove functionality.
 * Only fetches when user is authenticated.
 *
 * @returns {Object} Wishlist data, loading state, and mutation functions
 */
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch wishlist data
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: collectionService.getWishlist,
    enabled: isAuthenticated, // Only fetch if logged in
  });

  // Add game to wishlist mutation
  const addToWishlist = useMutation({
    mutationFn: collectionService.addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] }); // Refresh wishlist
    },
  });

  // Remove game from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: collectionService.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] }); // Refresh wishlist
    },
  });

  /**
   * Check if game is in wishlist
   * @param {string} gameId - Game ID to check
   * @returns {boolean} True if game is in wishlist
   */
  const isInWishlist = (gameId: string) => {
    return wishlist?.some((g) => g._id === gameId) ?? false;
  };

  return {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};

// Exported to GameDetails and other pages for wishlist management
