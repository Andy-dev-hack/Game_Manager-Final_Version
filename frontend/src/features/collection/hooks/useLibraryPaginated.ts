/**
 * useLibraryPaginated.ts
 * Custom hook for fetching user's library with server-side pagination.
 * Uses React Query for caching, loading states, and automatic refetching.
 */

import { useQuery } from "@tanstack/react-query";
import { collectionService } from "../../../services/collection.service";
import type { LibraryQueryParams } from "../../../services/collection.service";

/**
 * useLibraryPaginated Hook
 * Fetches user's library with pagination, search, and filters.
 * Data is always fresh (staleTime: 0) to prevent showing stale pages.
 *
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with data, loading, and error states
 */

export const useLibraryPaginated = (params: LibraryQueryParams = {}) => {
  return useQuery({
    queryKey: ["library", params],
    queryFn: () => collectionService.getLibrary(params),
    staleTime: 0, // Fresh data to prevent duplicates/stale pages
    refetchOnMount: true,
  });
};

// Exported to LibraryPage for data fetching with pagination
