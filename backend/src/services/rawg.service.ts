/**
 * @file rawg.service.ts
 * @description Service for interacting with RAWG API.
 * Provides game search, details retrieval, and screenshots.
 * Destination: Used by game controllers and aggregator service.
 */
import axios from "axios";
import NodeCache from "node-cache";
import { RAWG_API_KEY } from "../config/env";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

const RAWG_API_URL = "https://api.rawg.io/api";

// Cache configuration
// Search results: 1 hour (3600s)
// Game details: 24 hours (86400s)
const rawgCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// RAWG API response interfaces
interface RAWGPlatform {
  platform: {
    name: string;
  };
}

interface RAWGGenre {
  name: string;
}

interface RAWGDeveloper {
  name: string;
}

interface RAWGPublisher {
  name: string;
}

interface RAWGStore {
  store: {
    name: string;
  };
  url: string;
}

interface RAWGScreenshot {
  image: string;
}

// RAWG API game object from search/list endpoints
interface RAWGGameListItem {
  id: number;
  name: string;
  background_image: string;
  rating: number;
  platforms?: RAWGPlatform[];
  genres?: RAWGGenre[];
  released: string;
  metacritic: number;
}

// RAWG API params for fetchPopularPCGames
interface RAWGFetchParams {
  platforms: number;
  ordering: string;
  page: number;
  page_size: number;
  tags?: string;
  genres?: string;
}

export interface GameDetails {
  rawgId: number;
  name: string;
  description: string;
  cover: string;
  coverAdditional: string;
  rating: number;
  ratingTop: number;
  ratingsCount: number;
  metacritic: number;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  released: string;
  website: string;
  stores: { name: string; url: string }[];
}

// Create axios instance with RAWG API configuration
const rawgClient = axios.create({
  baseURL: RAWG_API_URL,
  params: {
    key: RAWG_API_KEY,
  },
});

/**
 * Search games by name in RAWG database
 * Destination: Used by game.controller.ts search endpoint.
 * Caching: Results cached for 1 hour.
 */
export const searchGames = async (query: string, limit = 10) => {
  const cacheKey = `search:${query}:${limit}`;
  const cachedData = rawgCache.get(cacheKey);

  if (cachedData) {
    logger.info(`Serving RAWG search from cache: ${query}`);
    return cachedData;
  }

  try {
    const response = await rawgClient.get("/games", {
      params: {
        search: query,
        page_size: limit,
      },
    });

    const results = response.data.results.map((game: RAWGGameListItem) => ({
      rawgId: game.id,
      name: game.name,
      cover: game.background_image,
      rating: game.rating,
      platforms:
        game.platforms?.map((p: RAWGPlatform) => p.platform.name) || [],
      genres: game.genres?.map((g: RAWGGenre) => g.name) || [],
      released: game.released,
      metacritic: game.metacritic,
    }));

    rawgCache.set(cacheKey, results);
    return results;
  } catch (error) {
    logger.error(`Error searching games in RAWG: ${error}`);
    throw new AppError("Failed to search games in RAWG", 500);
  }
};

// Interface for simplified game objects used in lists/scripts
export interface RAWGGameBasic {
  rawgId: number;
  title: string;
  metacritic?: number;
  released?: string;
}

/**
 * Fetch popular PC games from RAWG
 * Destination: Used by import-pc-games.ts script.
 * Params: platforms=4 (PC), ordering=-added (Popularity)
 */
export const fetchPopularPCGames = async (
  page = 1,
  pageSize = 40,
  genres?: string
) => {
  const genreKey = genres ? `:${genres}` : "";
  const cacheKey = `popular_pc:${page}:${pageSize}${genreKey}`;
  const cachedData = rawgCache.get<RAWGGameBasic[]>(cacheKey);

  if (cachedData) {
    logger.info(
      `Serving popular PC games from cache (Page ${page} ${genreKey})`
    );
    return cachedData;
  }

  try {
    const params: RAWGFetchParams = {
      platforms: 4, // PC
      ordering: "-added", // Most added to collections (Popularity)
      page: page,
      page_size: pageSize,
    };

    if (genres) {
      if (genres === "horror") {
        params.tags = genres;
      } else {
        params.genres = genres;
      }
    }

    const response = await rawgClient.get("/games", {
      params,
    });

    const results: RAWGGameBasic[] = response.data.results.map(
      (game: RAWGGameListItem) => ({
        rawgId: game.id,
        title: game.name,
        // Minimal data for list, full details fetched later
      })
    );

    rawgCache.set(cacheKey, results, 3600); // 1 hour cache
    return results;
  } catch (error) {
    logger.error(`Error fetching popular PC games: ${error}`);
    throw new AppError("Failed to fetch popular PC games", 500);
  }
};

/**
 * Fetch top games by date range and metacritic score
 * Destination: Used by import-top-games.ts script.
 */
export const fetchTopGames = async (
  startDate: string,
  endDate: string,
  page = 1,
  pageSize = 40
) => {
  const cacheKey = `top_games:${startDate}:${endDate}:${page}:${pageSize}`;
  const cachedData = rawgCache.get<RAWGGameBasic[]>(cacheKey);

  if (cachedData) {
    logger.info(`Serving top games from cache (Page ${page})`);
    return cachedData;
  }

  try {
    const params = {
      dates: `${startDate},${endDate}`,
      ordering: "-metacritic",
      page: page,
      page_size: pageSize,
    };

    const response = await rawgClient.get("/games", { params });

    const results: RAWGGameBasic[] = response.data.results.map(
      (game: RAWGGameListItem) => ({
        rawgId: game.id,
        title: game.name,
        metacritic: game.metacritic,
        released: game.released,
      })
    );

    rawgCache.set(cacheKey, results, 3600);
    return results;
  } catch (error) {
    logger.error(`Error fetching top games: ${error}`);
    throw new AppError("Failed to fetch top games", 500);
  }
};

/**
 * Get complete details of a game by RAWG ID
 * Destination: Used by game-aggregator.service.ts and game.controller.ts.
 * Caching: Details cached for 24 hours.
 */
export const getGameDetails = async (rawgId: number): Promise<GameDetails> => {
  const cacheKey = `details:${rawgId}`;
  const cachedData = rawgCache.get<GameDetails>(cacheKey);

  if (cachedData) {
    logger.info(`Serving RAWG details from cache: ${rawgId}`);
    return cachedData;
  }

  try {
    const response = await rawgClient.get(`/games/${rawgId}`);
    const game = response.data;

    const gameDetails: GameDetails = {
      rawgId: game.id,
      name: game.name,
      description: game.description_raw,
      cover: game.background_image,
      coverAdditional: game.background_image_additional,
      rating: game.rating,
      ratingTop: game.rating_top,
      ratingsCount: game.ratings_count,
      metacritic: game.metacritic,
      platforms:
        game.platforms?.map((p: RAWGPlatform) => p.platform.name) || [],
      genres: game.genres?.map((g: RAWGGenre) => g.name) || [],
      developers: game.developers?.map((d: RAWGDeveloper) => d.name) || [],
      publishers: game.publishers?.map((p: RAWGPublisher) => p.name) || [],
      released: game.released,
      website: game.website,
      stores:
        game.stores?.map((s: RAWGStore) => ({
          name: s.store.name,
          url: s.url,
        })) || [],
    };

    rawgCache.set(cacheKey, gameDetails, 86400); // 24 hours
    return gameDetails;
  } catch (error) {
    logger.error(`Error getting game details from RAWG: ${error}`);
    throw new AppError("Failed to get game details from RAWG", 500);
  }
};

/**
 * Get screenshots of a game
 * Destination: Used optionally for game detail pages.
 * Caching: Screenshots cached for 24 hours.
 */
export const getScreenshots = async (rawgId: number) => {
  const cacheKey = `screenshots:${rawgId}`;
  const cachedData = rawgCache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rawgClient.get(`/games/${rawgId}/screenshots`, {
      params: { page_size: 6 },
    });
    const screenshots = response.data.results.map(
      (s: RAWGScreenshot) => s.image
    );
    rawgCache.set(cacheKey, screenshots, 86400); // 24 hours
    return screenshots;
  } catch (error) {
    logger.error(`Error getting screenshots from RAWG: ${error}`);
    return [];
  }
};
