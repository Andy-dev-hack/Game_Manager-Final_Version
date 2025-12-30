/**
 * useCatalogUrl.ts
 * Custom hook for managing catalog page URL state (search, filters, sorting, pagination).
 * Provides synchronized URL parameters with debounced search updates.
 * Enables shareable URLs and browser back/forward navigation for catalog state.
 */

import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import debounce from "lodash.debounce";

/**
 * useCatalogUrl Hook
 * Manages catalog page state via URL search parameters.
 * Provides getters for current state and setters that update the URL.
 * Search updates are debounced (500ms) to avoid excessive URL changes.
 *
 * @returns Object with current params (query, genre, platform, sortBy, order, page) and setters
 */

export const useCatalogUrl = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read params
  const query = searchParams.get("query") || "";
  const genre = searchParams.get("genre") || "";
  const platform = searchParams.get("platform") || "";
  const developer = searchParams.get("developer") || "";
  const publisher = searchParams.get("publisher") || "";
  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : undefined;
  const onSale = searchParams.get("onSale") === "true";
  const sortBy = searchParams.get("sortBy") || "releaseDate";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Setters
  const setPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  // Debounced search setter
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
      }, 500),
    [setSearchParams]
  );

  const setSearch = (newQuery: string) => {
    // We might want to expose the raw setter or the debounced one.
    // Usually for inputs we want the raw value for controlled input, but the URL update debounced.
    // Here we return the debounced function to be called by the input's onChange.
    // ... wait, controlled inputs need local state.
    // UseCatalogUrl handles URL state. The Component should handle local state and call this debounced setter.
    debouncedSetSearch(newQuery);
  };

  const setFilter = (
    key: "genre" | "platform" | "developer" | "publisher",
    value: string
  ) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // Reset page on filter
    setSearchParams(newParams);
  };

  const setMaxPrice = (price?: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (price !== undefined) {
      newParams.set("maxPrice", price.toString());
    } else {
      newParams.delete("maxPrice");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const setOnSale = (enable: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (enable) {
      newParams.set("onSale", "true");
    } else {
      newParams.delete("onSale");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    newParams.set("page", "1");
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
    developer,
    publisher,
    maxPrice,
    onSale,
    sortBy,
    order,
    page,
    setPage,
    setSearch, // This is the DEBOUNCED setter
    setFilter,
    setMaxPrice,
    setOnSale,
    removeFilter,
    setSort,
    clearAll,
  };
};

// Exported to CatalogPage and CatalogControls for URL-based state management
