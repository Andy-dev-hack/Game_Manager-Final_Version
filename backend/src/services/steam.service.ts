/**
 * @file steam.service.ts
 * @description Service for interacting with Steam Store API.
 * Provides game pricing and details from Steam.
 * Destination: Used by game-aggregator.service.ts for price information.
 */
import axios from "axios";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

import NodeCache from "node-cache";

const STEAM_STORE_API_URL = "https://store.steampowered.com/api";

// Cache configuration
// Steam prices: 12 hours (43200s)
const steamCache = new NodeCache({ stdTTL: 43200, checkperiod: 600 });

// Steam API response interfaces
interface SteamPriceOverview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}

interface SteamGameData {
  name: string;
  header_image: string;
  price_overview?: SteamPriceOverview;
  is_free?: boolean;
  developers?: string[];
  publishers?: string[];
  genres?: Array<{ description: string }>;
}

interface SteamApiResponse {
  [appId: string]: {
    success: boolean;
    data?: SteamGameData;
  };
}

/**
 * Search for a game on Steam to get its App ID.
 * Uses the undocumented store search API.
 * @param query Game title
 * @returns Promise<number | null> App ID or null
 */
export const searchSteamGames = async (
  query: string
): Promise<number | null> => {
  try {
    const response = await axios.get(
      "https://store.steampowered.com/api/storesearch/",
      {
        params: {
          term: query,
          l: "english",
          cc: "US",
        },
      }
    );

    if (
      response.data &&
      response.data.items &&
      response.data.items.length > 0
    ) {
      return response.data.items[0].id;
    }
    return null;
  } catch (error) {
    logger.warn(`Steam search failed for "${query}": ${error}`);
    return null;
  }
};

/**
 * Get game details from Steam Store API by App ID
 * Destination: Used by game-aggregator.service.ts to get pricing.
 * Caching: Details cached for 12 hours.
 */
export const getSteamGameDetails = async (
  appId: number,
  currency: string = "us"
): Promise<SteamGameData | null> => {
  const cacheKey = `steam:${appId}:${currency}`;
  const cachedData = steamCache.get<SteamGameData>(cacheKey);

  if (cachedData) {
    logger.info(`Serving Steam details from cache: ${appId} (${currency})`);
    return cachedData;
  }

  try {
    const response = await axios.get<SteamApiResponse>(
      `${STEAM_STORE_API_URL}/appdetails`,
      {
        params: {
          appids: appId,
          cc: currency,
          l: "english",
        },
      }
    );

    const gameData = response.data[appId];

    if (!gameData || !gameData.success || !gameData.data) {
      logger.warn(`Steam game not found for App ID: ${appId}`);
      return null;
    }

    steamCache.set(cacheKey, gameData.data);
    return gameData.data;
  } catch (error) {
    logger.error(`Error fetching Steam game details: ${error}`);
    throw new AppError("Failed to fetch game details from Steam", 500);
  }
};

/**
 * Get Steam cover URL by App ID
 * Destination: Used for quick cover URL generation without full API call.
 */
export const getSteamCoverUrl = (appId: number): string => {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
};

/**
 * Extract Steam App ID from Steam store URL
 * Destination: Used to parse Steam URLs from RAWG stores data.
 */
export const extractSteamAppId = (url: string): number | null => {
  try {
    // Steam URL format: https://store.steampowered.com/app/1245620/Elden_Ring/
    // Handle query params ??, trailing slashes, and different positions
    const match = url.match(/\/app\/(\d+)/) || url.match(/\/app\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  } catch (error) {
    logger.error(`Error extracting Steam App ID from URL: ${error}`);
    return null;
  }
};
