/**
 * @file game-aggregator.service.ts
 * @description Aggregates game data from multiple sources (RAWG + Steam).
 * Combines metadata from RAWG with pricing from Steam.
 * Destination: Used by game.controller.ts for creating games from external APIs.
 */
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";
import { getGameDetails as getRAWGDetails, GameDetails } from "./rawg.service";
import {
  getSteamGameDetails,
  extractSteamAppId,
  searchSteamGames,
} from "./steam.service";

/**
 * Complete game data interface combining RAWG and Steam data
 * Destination: Returned by getCompleteGameData for game creation.
 */
interface CompleteGameData {
  title: string;
  description: string;
  image: string;
  genres: string[];
  platforms: string[];
  developer?: string;
  publisher?: string;
  score?: number;
  released?: Date;
  metacritic: number;
  screenshots: string[];
  rawgId: number;
  steamAppId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  onSale?: boolean;
  originalPrice?: number;
}

/**
 * Get complete game data by combining RAWG and Steam APIs
 * Destination: Used by game.controller.ts createFromRAWG endpoint.
 *
 * @param rawgId - RAWG game ID
 * @param steamAppId - Optional Steam App ID (if not provided, will try to find from RAWG stores)
 */
export const getCompleteGameData = async (
  rawgId: number,
  steamAppId?: number
): Promise<CompleteGameData> => {
  try {
    // Get data from RAWG
    const rawgData: GameDetails = await getRAWGDetails(rawgId);

    if (!rawgData) {
      throw new AppError("Game not found in RAWG", 404);
    }

    // Initialize complete game data with RAWG info
    const completeData: CompleteGameData = {
      title: rawgData.name,
      description: rawgData.description,
      image: rawgData.cover,
      genres: rawgData.genres || ["Unknown"],
      platforms: rawgData.platforms || ["Unknown"],
      developer: rawgData.developers[0],
      publisher: rawgData.publishers[0],
      score: rawgData.rating ? Math.round(rawgData.rating * 2) : undefined,
      released: rawgData.released ? new Date(rawgData.released) : undefined,
      metacritic: rawgData.metacritic,
      screenshots: [],
      rawgId: rawgData.rawgId,
    };

    // Try to get Steam App ID if not provided
    let finalSteamAppId = steamAppId;

    if (!finalSteamAppId && rawgData.stores) {
      // Look for Steam store in RAWG stores data
      const steamStore = rawgData.stores.find(
        (store: { name: string; url: string }) =>
          store.name.toLowerCase().includes("steam")
      );

      if (steamStore && steamStore.url) {
        const extractedId = extractSteamAppId(steamStore.url);
        if (extractedId) {
          finalSteamAppId = extractedId;
        }
      }
    }

    // Fallback: If no Steam App ID found via RAWG, search Steam by Name
    if (!finalSteamAppId) {
      try {
        const searchId = await searchSteamGames(rawgData.name);
        if (searchId) {
          finalSteamAppId = searchId;
          logger.info(
            `Found Steam App ID via search for '${rawgData.name}': ${finalSteamAppId}`
          );
        }
      } catch (searchError) {
        logger.warn(`Fallback Steam search failed for '${rawgData.name}'`);
      }
    }

    // Get pricing from Steam if App ID is available
    if (finalSteamAppId) {
      try {
        const steamData = await getSteamGameDetails(finalSteamAppId);

        if (steamData && steamData.price_overview) {
          completeData.steamAppId = finalSteamAppId;

          // Price Normalization Heuristic
          // Steam API usually returns cents (e.g. 4000 = 40.00).
          // Rule: If value > 100, assume cents and divide by 100. Otherwise keep as is.
          let finalPrice = steamData.price_overview.final;
          let initialPrice = steamData.price_overview.initial;

          if (finalPrice > 100) finalPrice = finalPrice / 100;
          if (initialPrice > 100) initialPrice = initialPrice / 100;

          completeData.price = finalPrice;
          completeData.currency = steamData.price_overview.currency;
          completeData.discount = steamData.price_overview.discount_percent;
          completeData.onSale = steamData.price_overview.discount_percent > 0;
          completeData.originalPrice = initialPrice;
        }
      } catch (error) {
        // Log but don't fail if Steam data is unavailable
        logger.warn(
          `Could not fetch Steam data for App ID ${finalSteamAppId}: ${error}`
        );
      }
    }

    return completeData;
  } catch (error) {
    logger.error(`Error aggregating game data: ${error}`);
    throw error instanceof AppError
      ? error
      : new AppError("Failed to aggregate game data", 500);
  }
};
