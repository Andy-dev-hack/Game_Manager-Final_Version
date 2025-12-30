/**
 * useAdmin.ts
 * Collection of custom hooks for admin-only operations.
 * Provides hooks for user management, game CRUD, and RAWG import functionality.
 * All hooks automatically invalidate relevant queries on successful mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";

/**
 * Hook to fetch all users (Admin only)
 * Supports pagination
 */
export const useUsers = (
  page: number = 1,
  limit: number = 20,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["admin", "users", page, limit, searchQuery],
    queryFn: () => adminService.getAllUsers(page, limit, searchQuery),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to update user role (Admin only)
 * Invalidates users query on success
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Hook to delete a user (Admin only)
 * Invalidates users query on success
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

/**
 * Hook to update a game (Admin only)
 * Invalidates games catalog on success
 */
export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      gameData,
    }: {
      gameId: string;
      gameData: FormData;
    }) => adminService.updateGame(gameId, gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

/**
 * Hook to delete a game (Admin only)
 * Invalidates games catalog on success
 */
export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => adminService.deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

/**
 * Hook to search RAWG database (Admin only)
 */
export const useSearchRAWG = (query: string) => {
  return useQuery({
    queryKey: ["admin", "rawg-search", query],
    queryFn: () => adminService.searchRAWG(query),
    enabled: query.length > 2, // Only search if query has 3+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to import game from RAWG (Admin only)
 * Invalidates games catalog on success
 */
export const useImportFromRAWG = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rawgId,
      steamAppId,
    }: {
      rawgId: number;
      steamAppId?: number;
    }) => adminService.importFromRAWG(rawgId, steamAppId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

/**
 * Hook to fetch all orders (Admin only)
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminService.getAllOrders(),
    staleTime: 60 * 1000,
  });
};

import { statsService } from "../services/stats.service";

/**
 * Hook to fetch dashboard statistics (Admin only)
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: () => statsService.getDashboardStats(),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch public global stats
 */
export const usePublicStats = () => {
  return useQuery({
    queryKey: ["public", "stats"],
    queryFn: () => statsService.getGlobalStats(),
    staleTime: 5 * 60 * 1000,
  });
};
