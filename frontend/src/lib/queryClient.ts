/**
 * queryClient.ts
 * React Query client configuration for global query settings.
 * Configures caching, stale time, and refetch behavior for all queries.
 * Used by QueryClientProvider in main.tsx to wrap the application.
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Global React Query client instance
 * Configured with optimized defaults for caching and refetching:
 * - staleTime: 5 minutes (data considered fresh)
 * - gcTime: 30 minutes (cache garbage collection)
 * - retry: 1 attempt on failure
 * - refetchOnWindowFocus: disabled (prevents aggressive refetching)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (Data is fresh for 5 mins)
      gcTime: 1000 * 60 * 30, // 30 minutes (Cache garbage collection)
      retry: 1,
      refetchOnWindowFocus: false, // Prevent aggressive refetching
    },
  },
});

// Exported to main.tsx for QueryClientProvider
