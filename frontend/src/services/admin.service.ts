/**
 * admin.service.ts
 * Service for admin-only operations including user and game management.
 * Provides CRUD operations for users and games, plus RAWG integration.
 * All endpoints require admin authentication.
 */

import apiClient from "./api.client";
import type { RAWGGame, RAWGSearchResponse } from "../types/rawg.types";
import type { Game } from "./games.service";

/**
 * User interface (admin view)
 * Represents user data visible to admins
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

/**
 * PaginatedUsers interface
 * Response structure for paginated user list
 */
export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

// ==================== ORDER MANAGEMENT ====================

export interface Order {
  _id: string;
  userId: string;
  totalAmount: number;
  status: string;
  items: Array<{
    gameId: string;
    title: string;
    price: number;
  }>;
  createdAt: string;
}

/**
 * Admin service
 * Collection of admin-only API operations for user and game management
 */
export const adminService = {
  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users (Admin only)
   * Endpoint: GET /api/users?page=1&limit=20
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    query: string = ""
  ): Promise<PaginatedUsers> {
    const { data } = await apiClient.get<PaginatedUsers>("/users", {
      params: { page, limit, query },
    });
    return data;
  },

  /**
   * Delete a user (Admin only)
   * Endpoint: DELETE /api/users/:id
   * Note: Backend cascade deletes UserGames, Orders, and RefreshTokens
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },

  /**
   * Change user role (Admin only)
   * Endpoint: PUT /api/users/:id/role
   */
  async updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
    const { data } = await apiClient.put<{ user: User }>(
      `/users/${userId}/role`,
      {
        role,
      }
    );
    return data.user;
  },

  // ==================== GAME MANAGEMENT ====================

  /**
   * Update an existing game (Admin only)
   * Endpoint: PUT /api/games/:id
   */
  async updateGame(gameId: string, gameData: FormData): Promise<Game> {
    const { data } = await apiClient.put<Game>(`/games/${gameId}`, gameData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /**
   * Delete a game (Admin only)
   * Endpoint: DELETE /api/games/:id
   * Note: Backend cascade deletes from all user collections
   */
  async deleteGame(gameId: string): Promise<void> {
    await apiClient.delete(`/games/${gameId}`);
  },

  /**
   * Search RAWG API for games
   * @param query - Search query string
   * @returns Array of RAWG games matching the query
   */
  async searchRAWG(query: string): Promise<RAWGGame[]> {
    const { data } = await apiClient.get<RAWGSearchResponse>(
      `/admin/rawg/search`,
      {
        params: { query },
      }
    );
    return data.results || [];
  },

  /**
   * Import a game from RAWG (Admin only)
   * Endpoint: POST /api/games/from-rawg
   */
  async importFromRAWG(rawgId: number, steamAppId?: number): Promise<Game> {
    const { data } = await apiClient.post<Game>("/games/from-rawg", {
      rawgId,
      steamAppId,
    });
    return data;
  },
  // ==================== ORDER MANAGEMENT ====================

  /**
   * Get all orders (Admin only)
   * Endpoint: GET /api/orders
   */
  async getAllOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>("/orders");
    return data;
  },

  /**
   * @deprecated Use statsService.getDashboardStats() instead.
   * Kept for backward compatibility during refactor.
   */
  async getDashboardStats(): Promise<unknown> {
    console.warn(
      "Using deprecated adminService.getDashboardStats. Switch to statsService."
    );
    const { data } = await apiClient.get("/stats/dashboard");
    return data;
  },
};

// Exported to useAdmin hooks for admin panel operations
