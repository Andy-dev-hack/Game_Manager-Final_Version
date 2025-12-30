/**
 * collection.service.ts
 * Service for fetching user's game library with pagination.
 * Handles API communication for collection endpoints.
 */

import apiClient from "./api.client";
import type { Game, PaginatedResponse } from "./games.service";

/**
 * Query parameters for library pagination
 */
export interface LibraryQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  genre?: string;
  platform?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * Library item interface (UserGame with populated game)
 */
export interface LibraryItem {
  _id: string;
  user: string;
  game: Game;
  status?: string;
  score?: number;
  review?: string;
  playtime?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection service
 * Provides methods for interacting with user's game library
 */
export const collectionService = {
  /**
   * Get user's library with server-side pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated library items
   */
  async getLibrary(
    params: LibraryQueryParams
  ): Promise<PaginatedResponse<LibraryItem>> {
    const { data } = await apiClient.get("/collection", { params });
    return data;
  },
};

// Exported to useLibraryPaginated hook for data fetching
