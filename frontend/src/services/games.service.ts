/**
 * games.service.ts
 * Service for fetching games catalog and individual game details.
 * Handles data transformation between backend response format and frontend interfaces.
 * Maps backend fields (e.g., 'released') to frontend fields (e.g., 'releaseDate').
 */

import apiClient from "./api.client";

/**
 * Game interface
 * Represents a game entity with all its properties
 */
export interface Game {
  _id: string;
  externalId?: number; // RAWG ID
  title: string;
  description: string;
  price: number;
  currency: string;
  platforms: string[];
  genres: string[]; // e.g., "Action RPG", "FPS", "Platformer"
  type: "game" | "dlc" | "bundle";
  releaseDate: string;
  developer: string;
  publisher: string;
  isOffer: boolean;
  offerPrice?: number;
  assets?: {
    cover: string;
    screenshots: string[];
    videos: string[];
  };
  onSale?: boolean;
  originalPrice?: number;
  score?: number;
  metacritic?: number;
  image?: string; // Fallback for backend compatibility
  isExternal?: boolean; // New Flag for Unified Search
  rawgId?: number; // New Flag for Import
  prices?: Record<string, number>;
  slug?: string;
  avgPlaytime?: number;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface GamesQueryParams {
  page?: number;
  limit?: number;
  query?: string; // Changed from 'search' to match backend
  genre?: string;
  platform?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  onSale?: boolean;
  maxPrice?: number;
  developer?: string;
  publisher?: string;
}

// New interfaces for Catalog
interface CatalogParams {
  page?: number;
  limit?: number;
  query?: string;
  genre?: string;
  platform?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  developer?: string;
  publisher?: string;
}

export interface BackendGame extends Partial<Omit<Game, "assets">> {
  platforms?: string[];
  platform?: string; // Legacy support
  assets?: Game["assets"];
  image?: string;
  screenshots?: string[];
  released?: string; // Some endpoints use 'released' instead of 'releaseDate'
  stats?: {
    score?: number;
    rating?: number;
  };
}

// Standardized Backend Response structure locally used
interface BackendCatalogResponse {
  data: BackendGame[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export const gamesService = {
  // Public Endpoint: Search/Filter Catalog
  async getCatalog(
    params: CatalogParams = {}
  ): Promise<PaginatedResponse<Game>> {
    const r = await apiClient.get<BackendCatalogResponse>("/public/games", {
      params,
    });

    // Map backend standardized response to frontend entity
    const games: Game[] = r.data.data.map((g) => ({
      _id: g._id || "", // Fallback for strict type (backend always sends _id)
      title: g.title || "Untitled",
      description: g.description || "",
      price: g.price || 0,
      currency: g.currency || "USD",
      prices: g.prices,
      image: g.image || "https://placehold.co/600x400/101010/FFF?text=No+Cover",
      platforms: g.platforms || [],
      genres: g.genres || [],
      type: "game",
      releaseDate: g.released || "",
      developer: g.developer || "Unknown",
      publisher: g.publisher || "Unknown",
      isOffer: g.isOffer || false,
      score: g.stats?.score,
      metacritic: g.stats?.rating,
      assets: g.assets || {
        cover:
          g.image || "https://placehold.co/600x400/101010/FFF?text=No+Cover",
        screenshots: [],
        videos: [],
      },
      tags: [],
      slug: g.slug || "",
      avgPlaytime: 0,
      isExternal: false,
      originalPrice: g.originalPrice,
      onSale: g.onSale,
    }));

    return {
      data: games,
      pagination: {
        total: r.data.pagination.total,
        pages: r.data.pagination.pages,
        page: r.data.pagination.page,
        limit: r.data.pagination.limit,
      },
    };
  },

  // Public Endpoint: Fetch single game
  async getGameById(id: string): Promise<Game> {
    interface BackendGameResponse extends Omit<Game, "assets" | "releaseDate"> {
      assets?: Game["assets"];
      releaseDate?: string;
      released?: string;
      image?: string;
      screenshots?: string[];
    }

    const { data: rawGame } = await apiClient.get<BackendGameResponse>(
      `/public/games/${id}`
    );

    // Map backend structure to frontend interface
    return {
      ...rawGame,
      releaseDate: rawGame.released || rawGame.releaseDate || "", // Backend uses 'released'
      assets: rawGame.assets || {
        cover:
          rawGame.image ||
          "https://placehold.co/600x400/101010/FFF?text=No+Cover",
        screenshots: Array.isArray(rawGame.screenshots)
          ? rawGame.screenshots.filter(
              (s): s is string => typeof s === "string" && s.startsWith("http")
            )
          : [],
        videos: [],
      },
    };
  },

  // Public: Get filters
  async getFilters(): Promise<{ genres: string[]; platforms: string[] }> {
    const { data } = await apiClient.get<{
      genres: string[];
      platforms: string[];
    }>("/public/games/filters");
    return data;
  },

  // Unified Search (Local + Remote)
  async searchUnified(
    params: GamesQueryParams | string
  ): Promise<PaginatedResponse<Game>> {
    // Handle overload: if string, treat as query
    const queryParams: Record<string, string | number | boolean | undefined> =
      typeof params === "string"
        ? { query: params }
        : (params as Record<string, string | number | boolean | undefined>);

    // Build query with filters
    const searchParams = new URLSearchParams();
    if (queryParams.query) searchParams.append("q", String(queryParams.query)); // Backend expects 'q' for unified search
    if (queryParams.genre)
      searchParams.append("genre", String(queryParams.genre));
    if (queryParams.platform)
      searchParams.append("platform", String(queryParams.platform));
    if (queryParams.developer)
      searchParams.append("developer", String(queryParams.developer));

    interface UnifiedSearchResult {
      results: Array<{
        _id: string;
        title: string;
        image: string;
        price?: number;
        currency?: string;
        isExternal: boolean;
        rawgId?: number;
        platforms?: string[];
        genres?: string[];
        developer?: string;
        publisher?: string;
        stats?: {
          score?: number;
          rating?: number;
        };
      }>;
    }

    const { data } = await apiClient.get<UnifiedSearchResult>(
      `/discovery?${searchParams.toString()}`
    );

    // Map Unified Result to Game Interface
    const games: Game[] = data.results.map((r) => ({
      _id: r._id || "", // Backend always provides _id, but type needs reassurance
      title: r.title,
      description: "", // Unified search doesn't return description in list view
      image: r.image,
      assets: {
        cover: r.image,
        screenshots: [],
        videos: [],
      },
      price: r.price || 0,
      currency: r.currency || "USD",
      isExternal: r.isExternal,
      rawgId: r.rawgId,
      platforms: r.platforms || ["Unknown"],
      genres: r.genres || [],
      type: "game",
      releaseDate: "",
      developer: r.developer || "",
      publisher: r.publisher || "",
      score: r.stats?.score,
      metacritic: r.stats?.rating,
      isOffer: false,
    }));

    return {
      data: games,
      pagination: {
        total: games.length,
        pages: 1,
        page: 1,
        limit: games.length,
      },
    };
  },
};
