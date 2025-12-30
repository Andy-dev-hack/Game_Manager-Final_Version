/**
 * @file game.service.ts
 * @description Manages the global game catalog. Handles searching, creating, and updating games.
 */
import mongoose, { SortOrder } from "mongoose";
import Game, { IGame } from "../models/game.model";
import { AppError } from "../utils/AppError";

import UserGame from "../models/userGame.model";
// ...

// Search games with advanced filtering and sorting
export const searchGames = async (
  query: string,
  page: number = 1,
  limit: number = 10,
  genre?: string,
  platform?: string,
  sortBy: string = "releaseDate",
  order: "asc" | "desc" = "desc",
  onSale?: boolean,
  maxPrice?: number,
  developer?: string,
  publisher?: string
) => {
  // Use strict MongoDB filter type for safety during construction
  const filter: mongoose.mongo.Filter<IGame> = {};

  // Multi-field search using $or operator (Title, Genre, Developer, Publisher, Platform)
  // This allows finding "Cyber" -> "Cyberpunk" across multiple fields
  if (query) {
    const regex = { $regex: query, $options: "i" };
    filter.$or = [
      { title: regex },
      { genres: regex },
      { developer: regex },
      { publisher: regex },
      { platforms: regex },
    ];
  }

  // Exact filters
  if (genre) filter.genres = genre;
  if (platform) filter.platforms = platform;
  if (onSale) filter.onSale = true;
  if (developer) filter.developer = developer;
  if (publisher) filter.publisher = publisher;

  // Price range filter
  if (maxPrice !== undefined) {
    filter.price = { $lte: maxPrice };
  }

  const skip = (page - 1) * limit;

  // Sorting logic
  const sortOptions: { [key: string]: SortOrder } = {};
  // Handle specific sort fields
  if (sortBy === "price") {
    // Sort by base price
    sortOptions["price"] = order === "asc" ? 1 : -1;
  } else {
    // Default sorting
    sortOptions[sortBy] = order === "asc" ? 1 : -1;
  }

  // CRITICAL: Always add _id as secondary sort to ensure deterministic ordering
  // This prevents duplicate games across pages when primary sort field has duplicates
  sortOptions["_id"] = 1;

  // Execute query with strict types (no 'any' cast needed)
  const games = await Game.find(filter as Record<string, unknown>)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  const total = await Game.countDocuments(filter as Record<string, unknown>);

  return {
    data: games,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
};

// Get distinct filters (Genres and Platforms)
// Helper method for the frontend to populate filter dropdowns
export const getFilters = async () => {
  const genres = await Game.distinct("genres");
  const platforms = await Game.distinct("platforms");
  return {
    genres: genres.filter(Boolean).sort(),
    platforms: platforms.filter(Boolean).sort(),
  };
};

// Create a game in the catalog (if not exists)
// Destination: Used by GameController.create (src/controllers/game.controller.ts).
// Checks for duplicates based on title and platform before creating.
export const createCatalogGame = async (
  gameData: Partial<IGame>
): Promise<IGame> => {
  const { title } = gameData;

  // Verificar si ya existe
  const existingGame = await Game.findOne({ title });
  if (existingGame) {
    return existingGame;
  }

  const game = new Game(gameData);
  return await game.save();
};

// Get game by ID
// Destination: Used by GameController.getOne and CollectionService.addToCollection.
export const getCatalogGameById = async (gameId: string): Promise<IGame> => {
  const game = await Game.findById(gameId);
  if (!game) throw new AppError("Game not found in catalog", 404);
  return game;
};

// Delete game from catalog
// Destination: Used by GameController.deleteGame (src/controllers/game.controller.ts).
// Implements Cascade Delete: Removes Game and related UserGame entries.
export const deleteCatalogGame = async (
  gameId: string
): Promise<IGame | null> => {
  // 1. Delete associated UserGames (Collection items)
  await UserGame.deleteMany({ game: gameId });

  // 2. Delete Game from Catalog
  const deletedGame = await Game.findByIdAndDelete(gameId);
  if (!deletedGame)
    throw new AppError("Juego no encontrado en el catálogo", 404);
  return deletedGame;
};

// Update game in catalog
// Destination: Used by GameController.updateGame (src/controllers/game.controller.ts).
export const updateCatalogGame = async (
  gameId: string,
  gameData: Partial<IGame>
): Promise<IGame | null> => {
  const updatedGame = await Game.findByIdAndUpdate(gameId, gameData, {
    new: true,
  });
  if (!updatedGame)
    throw new AppError("Juego no encontrado en el catálogo", 404);
  return updatedGame;
};
