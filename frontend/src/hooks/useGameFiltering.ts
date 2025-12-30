import { useState, useMemo } from "react";
import type { Game } from "../services/games.service";

export interface FilterState {
  query: string;
  genre: string;
  platform: string;
  sortBy: string;
  order: "asc" | "desc";
}

export const useGameFiltering = (games: Game[] | undefined) => {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    genre: "",
    platform: "",
    sortBy: "releaseDate",
    order: "desc",
  });

  const filteredGames = useMemo(() => {
    if (!games) return [];

    let result = [...games];

    // 1. Text Search (Title, Publisher, Developer)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(q) ||
          game.publisher?.toLowerCase().includes(q) ||
          game.developer?.toLowerCase().includes(q)
      );
    }

    // 2. Genre Filter
    if (filters.genre) {
      result = result.filter((game) => game.genres?.includes(filters.genre!));
    }

    // 3. Platform Filter
    if (filters.platform) {
      result = result.filter((game) =>
        game.platforms?.includes(filters.platform)
      );
    }

    // 4. Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "price":
          // Handle offers if needed, currently using base price
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "releaseDate":
        default: {
          const dateA = new Date(a.releaseDate).getTime();
          const dateB = new Date(b.releaseDate).getTime();
          comparison = dateA - dateB;
          break;
        }
      }

      return filters.order === "asc" ? comparison : -comparison;
    });

    return result;
  }, [games, filters]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, query: value }));
  };

  const handleGenreChange = (value: string) => {
    setFilters((prev) => ({ ...prev, genre: value }));
  };

  const handlePlatformChange = (value: string) => {
    setFilters((prev) => ({ ...prev, platform: value }));
  };

  const handleSortChange = (sortBy: string, order: "asc" | "desc") => {
    setFilters((prev) => ({ ...prev, sortBy, order }));
  };

  const handleClear = () => {
    setFilters({
      query: "",
      genre: "",
      platform: "",
      sortBy: "releaseDate",
      order: "desc",
    });
  };

  return {
    filteredGames,
    filters,
    handleSearchChange,
    handleGenreChange,
    handlePlatformChange,
    handleSortChange,
    handleClear,
  };
};
