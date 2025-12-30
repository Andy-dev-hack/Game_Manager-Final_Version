/**
 * useGameDetails.ts
 * Custom hook for fetching individual game details.
 * Uses React Query for caching and automatic refetching.
 * Only fetches when game ID is provided (enabled guard).
 */

import { useQuery } from "@tanstack/react-query";
import { gamesService } from "../../../services/games.service";

/**
 * useGameDetails hook
 * Fetches detailed information for a specific game by ID.
 *
 * @param {string | undefined} id - Game ID to fetch
 * @returns {UseQueryResult} React Query result with game data
 */
export const useGameDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ["game", id], // Cache key includes game ID
    queryFn: () => gamesService.getGameById(id!), // Fetch game details
    enabled: !!id, // Only fetch if ID exists
  });
};

// Exported to GameDetails page for displaying game information
