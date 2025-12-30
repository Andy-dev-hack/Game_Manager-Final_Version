/**
 * collection.service.ts
 * Service for managing user's game collection and wishlist.
 * Handles library retrieval, status updates, and wishlist operations.
 */

import apiClient from "../../../services/api.client";
import type { Game } from "../../../services/games.service";

/**
 * CollectionItem interface
 * Represents a game in user's library with status and metadata
 */
export interface CollectionItem {
  _id: string;
  game: Game; // Full game data
  user: string; // User ID
  status: "playing" | "completed" | "backlog" | "dropped"; // Game status
  score?: number; // User's rating (optional)
  notes?: string; // User notes (optional)
  addedAt: string; // Date added to library
}

/**
 * Collection service
 * Provides methods for library and wishlist management
 */
export const collectionService = {
  /**
   * Get user's game library
   * Fetches all games owned by authenticated user
   * @returns {Promise<CollectionItem[]>} User's game collection
   */
  async getLibrary(): Promise<CollectionItem[]> {
    const { data } = await apiClient.get<{ data: CollectionItem[] }>(
      "/collection",
      { params: { limit: 1000 } }
    );
    return data.data;
  },

  /**
   * Update game status in library
   * Changes game status (playing, completed, backlog, dropped)
   * @param {string} id - Collection item ID
   * @param {string} status - New status
   * @returns {Promise<CollectionItem>} Updated collection item
   */
  async updateStatus(
    id: string,
    status: CollectionItem["status"]
  ): Promise<CollectionItem> {
    const { data } = await apiClient.put<CollectionItem>(
      `/collection/${id}/status`,
      { status }
    );
    return data;
  },

  /**
   * Get user's wishlist
   * Fetches games user wants to purchase
   * @returns {Promise<Game[]>} Wishlist games
   */
  async getWishlist(): Promise<Game[]> {
    const { data } = await apiClient.get<Game[]>("/users/wishlist");
    return data;
  },

  /**
   * Add game to wishlist
   * @param {string} gameId - Game ID to add
   */
  async addToWishlist(gameId: string): Promise<void> {
    await apiClient.post(`/users/wishlist/${gameId}`);
  },

  /**
   * Remove game from wishlist
   * @param {string} gameId - Game ID to remove
   */
  async removeFromWishlist(gameId: string): Promise<void> {
    await apiClient.delete(`/users/wishlist/${gameId}`);
  },
};

// Exported to useLibrary and useWishlist hooks for collection management
