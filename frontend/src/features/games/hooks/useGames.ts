/**
 * useGames.ts
 * Custom hook for fetching games catalog with standard pagination.
 * Uses React Query's useQuery with keepPreviousData for smooth page transitions.
 * Supports search, filtering, and sorting via query parameters.
 */

import { useQuery } from "@tanstack/react-query";
import {
  gamesService,
  type GamesQueryParams,
} from "../../../services/games.service";

/**
 * useGames hook
 * Fetches paginated games catalog with standard pagination.
 * Fresh data on every page change to prevent duplicates.
 */
export const useGames = (params: GamesQueryParams = {}) => {
  return useQuery({
    queryKey: ["games", params],
    queryFn: () => {
      // PROMPT_AI: Unified Search Switch
      // When a query exists, use the Unified Search endpoint to trigger Eager Sync (RAWG -> Local).
      // Otherwise, just fetch the local catalog.
      if (params.query && params.query.length >= 2) {
        return gamesService.searchUnified(params);
      }
      return gamesService.getCatalog(params);
    },
    staleTime: 0, // Always fetch fresh data to prevent duplicates
    refetchOnMount: true, // Refetch when component mounts
  });
};

/**
 * useFilters hook
 * Fetches available genres and platforms for filtering.
 * High staleTime to avoid unnecessary refetches.
 */
export const useFilters = () => {
  return useQuery({
    queryKey: ["filters"],
    queryFn: gamesService.getFilters,
    staleTime: Infinity, // Filters rarely change
  });
};

// Exported to Home and other pages for games catalog display
