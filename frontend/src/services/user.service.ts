/**
 * user.service.ts
 * Service for handling user-related API requests.
 * Provides wishlist management operations using /users endpoints.
 * Alternative to collection.service.ts, used by WishlistContext for optimistic updates.
 */
import apiClient from "./api.client";
import type { Game, BackendGame } from "./games.service";

/**
 * Interface for Wishlist response from backend
 */
export interface WishlistResponse {
  wishlist: BackendGame[]; // Array of games in user's wishlist
}

/**
 * Get user's wishlist (all items, for context)
 * Fetches all games in the authenticated user's wishlist.
 * Maps backend structure to frontend Game interface.
 * Note: This fetches ALL items for WishlistContext. For paginated display, use getWishlistPaginated.
 *
 * @returns Promise with array of games in wishlist
 */
export const getWishlist = async (): Promise<Game[]> => {
  // Fetch with a large limit to get all items for the context
  const response = await apiClient.get("/users/wishlist", {
    params: { limit: 1000 }, // Large limit to get all items
  });

  // Backend now returns {data: Game[], pagination: {...}}
  const games = response.data.data || [];

  // Map backend structure to frontend Game interface
  return games.map((game: BackendGame) => ({
    _id: game._id || "",
    title: game.title || "Untitled",
    description: game.description || "",
    price: game.price || 0,
    currency: game.currency || "USD",
    platforms:
      game.platforms || (game.platform ? [game.platform] : ["Unknown"]),
    genres: game.genres || ["Unknown"],
    type: game.type || "game",
    releaseDate: game.released || game.releaseDate || "",
    developer: game.developer || "Unknown",
    publisher: game.publisher || "Unknown",
    isOffer: !!game.isOffer,
    offerPrice: game.offerPrice,
    score: game.score,
    assets: game.assets || {
      cover:
        game.image || "https://placehold.co/600x400/101010/FFF?text=No+Cover",
      screenshots: Array.isArray(game.screenshots)
        ? game.screenshots.filter((s) => s.startsWith("http"))
        : [],
      videos: [],
    },
  }));
};

/**
 * Add game to wishlist
 * Adds a game to the authenticated user's wishlist.
 * Backend returns updated wishlist IDs, but we typically refetch in context.
 *
 * @param gameId - ID of the game to add to wishlist
 * @returns Promise with void
 */
export const addToWishlist = async (gameId: string): Promise<void> => {
  try {
    await apiClient.post(`/users/wishlist/${gameId}`);
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    throw error;
  }
};

/**
 * Remove game from wishlist (Alternate system)
 * @param gameId - ID of game to remove
 */
export const removeFromWishlist = async (gameId: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/wishlist/${gameId}`);
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    throw error;
  }
};

/**
 * Query parameters for wishlist pagination
 */
export interface WishlistQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  genre?: string;
  platform?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * Paginated response interface
 */
export interface PaginatedWishlistResponse {
  data: Game[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

/**
 * Get user's wishlist with server-side pagination
 * Fetches paginated games from the authenticated user's wishlist.
 * Supports search, filtering, and sorting.
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with paginated wishlist data
 */
export const getWishlistPaginated = async (
  params: WishlistQueryParams = {}
): Promise<PaginatedWishlistResponse> => {
  const { data } = await apiClient.get("/users/wishlist", { params });
  return data;
};

// Exported to WishlistContext for wishlist management with optimistic updates
// Exported to useWishlistPaginated for paginated display
