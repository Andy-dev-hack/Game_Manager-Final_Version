/**
 * @file discovery.service.ts
 * @description Service for Unified Search (Discovery) with Eager Sync.
 * Searches RAWG, imports new games immediately via Aggregator, and returns local games.
 */
import mongoose from "mongoose";
import Game, { IGame } from "../models/game.model";
import { searchGames as searchRAWG } from "./rawg.service";
import { getCompleteGameData } from "./game-aggregator.service";
import { UnifiedGame, DiscoveryResponse } from "../dtos/discovery.dto";
import logger from "../utils/logger";

/**
 * Interface for RAWG game search results
 */
interface RAWGGameResult {
  rawgId: number;
  name: string;
  released?: string;
  background_image?: string;
}

/**
 * Normalizes a string for comparison (removes spaces, special chars, lowercase)
 */
const normalizeTitle = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Searches for games. If found in RAWG but not locally, imports them first.
 * Then returns the list of local games.
 * @param query - Search term
 */
export const searchAndSync = async (
  query: string,
  filters?: { genre?: string; platform?: string; developer?: string }
): Promise<DiscoveryResponse> => {
  if (!query) return { results: [], source: "local" };

  try {
    // 1. Search Local DB First
    const localQuery: Record<string, unknown> = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { genres: { $regex: query, $options: "i" } }, // Search in genres array
        { developer: { $regex: query, $options: "i" } }, // Search by Developer
        { platforms: { $regex: query, $options: "i" } }, // Search by Platform
      ],
    };

    // Apply Local Filters
    // Apply Local Filters
    if (filters) {
      if (filters.genre) {
        // Filter by specific genre in the array
        localQuery.genres = { $regex: filters.genre, $options: "i" };
      }
      if (filters.developer) {
        localQuery.developer = { $regex: filters.developer, $options: "i" };
      }
      if (filters.platform) {
        localQuery.platforms = { $regex: filters.platform, $options: "i" };
      }
    }

    const localResults = await Game.find(localQuery)
      .limit(20)
      .sort({ isOwned: -1, _id: 1 });

    // 2. Search RAWG (Broader search by title)
    // We search broadly to import potential matches, then strict filter later
    let rawgResults: RAWGGameResult[] = [];
    try {
      rawgResults = await searchRAWG(query, 5); // [CHANGE] Removed filters arg
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.warn(`DiscoveryService: RAWG search failed: ${errorMessage}`);
      // Continue with just local results
    }

    // 3. Identify New Games to Import
    const existingTitles = new Set(
      localResults.map((g) => normalizeTitle(g.title))
    );
    const existingRawgIds = new Set(
      localResults.map((g) => g.rawgId).filter((id) => id !== undefined)
    );

    const gamesToImport = rawgResults.filter((rawgGame) => {
      const normTitle = normalizeTitle(rawgGame.name);
      return (
        !existingTitles.has(normTitle) && !existingRawgIds.has(rawgGame.rawgId)
      );
    });

    // 4. Eager Import (Sync) using Aggregator
    const importPromises = gamesToImport.map(async (rawgGame) => {
      try {
        const exists = await Game.exists({ rawgId: rawgGame.rawgId });
        if (exists) return null;

        // Use Aggregator Service to get FULL data (RAWG + Steam Price)
        const completeData = await getCompleteGameData(rawgGame.rawgId);

        // Create Game
        const newGame = new Game({
          title: completeData.title,
          description: completeData.description || "No description available.",
          price: completeData.price || 0,
          currency: completeData.currency || "USD",
          platforms: completeData.platforms,
          genres: completeData.genres || [], // [FIX] Map to genres array
          type: "game",
          releaseDate: completeData.released
            ? completeData.released.toISOString()
            : "",
          developer: completeData.developer || "Unknown",
          publisher: completeData.publisher || "Unknown",
          image: completeData.image,
          score: completeData.score, // [FIX] Save score
          metacritic: completeData.metacritic, // [FIX] Save metacritic
          assets: {
            cover: completeData.image,
            screenshots: completeData.screenshots || [],
            videos: [],
          },
          rawgId: completeData.rawgId,
          onSale: completeData.onSale || false,
          // Defaults
          isOwned: false,
          favorite: false,
          wishlist: false,
        });

        return await newGame.save();
      } catch (importError) {
        const errorMessage =
          importError instanceof Error ? importError.message : "Unknown error";
        logger.error(`Failed to import ${rawgGame.name}: ${errorMessage}`);
        return null;
      }
    });

    const normalizedImports = (await Promise.all(importPromises)).filter(
      (g): g is NonNullable<typeof g> => g !== null
    );

    // 6. Strict Post-Filtering (In-Memory) for Imported Games
    // Ensure the imported games actually match the requested filters
    const filteredImports = normalizedImports.filter((game) => {
      if (!filters) return true;

      // Filter by Genre
      if (filters.genre) {
        // Check if ANY of the game's genres matches the filter
        const genreMatch =
          game.genres &&
          game.genres.some((g: string) =>
            g.toLowerCase().includes(filters.genre!.toLowerCase())
          );
        if (!genreMatch) return false;
      }

      // Filter by Developer
      if (filters.developer) {
        if (
          !game.developer ||
          !game.developer
            .toLowerCase()
            .includes(filters.developer.toLowerCase())
        ) {
          return false;
        }
      }

      // Filter by Platform
      if (filters.platform) {
        const platformMatch = game.platforms.some((p) =>
          p.toLowerCase().includes(filters.platform!.toLowerCase())
        );
        if (!platformMatch) return false;
      }

      return true;
    });

    // 7. Combine & Return
    const allGames = [...localResults, ...filteredImports];

    const unifiedResults: UnifiedGame[] = allGames.map((game) => ({
      _id: game._id.toString(),
      title: game.title,
      image: game.image || "",
      price: game.price,
      currency: game.currency,
      genres: game.genres || [], // [FIX] Map genres array
      stats: {
        score: game.score,
        rating: game.metacritic,
      },
      developer: game.developer,
      publisher: game.publisher,
      isExternal: false, // All considered local now
      inLibrary: false,
      rawgId: game.rawgId,
      platforms: game.platforms,
    }));

    return {
      results: unifiedResults,
      source: "mixed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`DiscoveryService Error: ${errorMessage}`);
    return { results: [], source: "local" };
  }
};
