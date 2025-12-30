/**
 * useLibrary.ts
 * Custom hook for fetching user's game library.
 * Only fetches when user is authenticated.
 * Uses React Query for caching and automatic refetching.
 */

import { useQuery } from "@tanstack/react-query";
import { collectionService } from "../services/collection.service";
import { useAuth } from "../../auth/AuthContext";

/**
 * useLibrary hook
 * Fetches authenticated user's game library.
 * Automatically disabled when user is not logged in.
 *
 * @returns {UseQueryResult} React Query result with library data
 */
export const useLibrary = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["library"], // Cache key for user's library
    queryFn: collectionService.getLibrary, // Fetch library from backend
    enabled: isAuthenticated, // Only fetch if user is logged in
  });
};

// Exported to LibraryPage for displaying user's owned games
