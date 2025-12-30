/**
 * useWishlistUrl.ts
 * Custom hook for managing wishlist page URL state (search, filters, sorting, pagination).
 * Provides synchronized URL parameters with debounced search updates.
 * Enables shareable URLs and browser back/forward navigation for wishlist state.
 */

import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import debounce from "lodash.debounce";

/**
 * useWishlistUrl Hook
 * Manages wishlist page state via URL search parameters.
 * Provides getters for current state and setters that update the URL.
 * Search updates are debounced (300ms) to avoid excessive URL changes.
 *
 * @returns Object with current params (query, genre, platform, sortBy, order, page) and setters
 */

export const useWishlistUrl = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read params
  const query = searchParams.get("query") || "";
  const genre = searchParams.get("genre") || "";
  const platform = searchParams.get("platform") || "";
  const sortBy = searchParams.get("sortBy") || "title";
  const order = (searchParams.get("order") as "asc" | "desc") || "asc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Setters
  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  // Debounced search setter (300ms)
  const debouncedSetSearch = useMemo(
    () =>
      debounce((newQuery: string) => {
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          if (newQuery) {
            params.set("query", newQuery);
          } else {
            params.delete("query");
          }
          params.set("page", "1"); // Reset page on search
          return params;
        });
      }, 300),
    [setSearchParams]
  );

  const setSearch = (newQuery: string) => {
    debouncedSetSearch(newQuery);
  };

  const setGenre = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("genre", value);
    } else {
      newParams.delete("genre");
    }
    newParams.set("page", "1"); // Reset page on filter
    setSearchParams(newParams);
  };

  const setPlatform = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("platform", value);
    } else {
      newParams.delete("platform");
    }
    newParams.set("page", "1"); // Reset page on filter
    setSearchParams(newParams);
  };

  const setSort = (newSort: string, newOrder: "asc" | "desc") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", newSort);
    newParams.set("order", newOrder);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearAll = () => {
    setSearchParams({});
  };

  return {
    query,
    genre,
    platform,
    sortBy,
    order,
    page,
    setPage,
    setSearch, // Debounced setter
    setGenre,
    setPlatform,
    setSort,
    clearAll,
  };
};

// Exported to WishlistPage for URL-based state management
