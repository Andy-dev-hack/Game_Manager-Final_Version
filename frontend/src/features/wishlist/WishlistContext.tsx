/**
 * WishlistContext.tsx
 * Context provider for managing user's wishlist.
 * Handles adding, removing, and checking items in the wishlist with backend persistence.
 */
import { createContext, useContext } from "react";
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

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
