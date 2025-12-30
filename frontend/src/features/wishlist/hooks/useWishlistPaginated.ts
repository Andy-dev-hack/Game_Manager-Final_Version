/**
 * useWishlistPaginated.ts
 * Custom hook for fetching user's wishlist with server-side pagination.
 * Uses React Query for caching, loading states, and automatic refetching.
 */

import { useQuery } from "@tanstack/react-query";
import { getWishlistPaginated } from "../../../services/user.service";
import type { WishlistQueryParams } from "../../../services/user.service";

/**
 * useWishlistPaginated Hook
 * Fetches user's wishlist with pagination, search, and filters.
 * Data is always fresh (staleTime: 0) to prevent showing stale pages.
 *
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with data, loading, and error states
 */

export const useWishlistPaginated = (params: WishlistQueryParams = {}) => {
  return useQuery({
    queryKey: ["wishlist-paginated", params],
    queryFn: () => getWishlistPaginated(params),
    staleTime: 0, // Fresh data to prevent duplicates/stale pages
    refetchOnMount: true,
  });
};

// Exported to WishlistPage for data fetching with pagination
