/**
 * @file collection.service.ts
 * @description Manages the user's personal game collection.
 * Links users to games and stores personal metadata (score, status, review).
 */
import mongoose, { PipelineStage } from "mongoose";
import UserGame, { IUserGame } from "../models/userGame.model";
import { getCatalogGameById } from "./game.service";
import { AppError } from "../utils/AppError";

// Add game to collection
// Destination: Used by CollectionController.addToCollection (src/controllers/collection.controller.ts).
// Verifies game existence and prevents duplicates in user's collection.
export const addToCollection = async (
  userId: string,
  gameId: string,
  collectionData: Partial<IUserGame>
): Promise<IUserGame> => {
  // Verificar que el juego existe en el catálogo
  await getCatalogGameById(gameId);

  // Verificar si ya lo tiene
  const existing = await UserGame.findOne({ user: userId, game: gameId });
  if (existing) throw new AppError("El juego ya está en tu colección", 400);

  return await UserGame.create({
    user: userId,
    game: gameId,
    ...collectionData,
  });
};

// Get user collection
// Destination: Used by CollectionController.getCollection (src/controllers/collection.controller.ts).
// Uses MongoDB Aggregation Pipeline to join UserGames with Games.
// Allows filtering by fields from both collections.
export const getCollection = async (
  userId: string,
  page: number = 1,
  limit: number = 12,
  query?: string,
  status?: string,
  genre?: string,
  platform?: string,
  sortBy?: string,
  order?: "asc" | "desc"
) => {
  // Page validation - clamp to valid range
  const validPage = Math.max(1, page);
  const skip = (validPage - 1) * limit;

  // Use strict MongoDB filter type
  const filter: mongoose.mongo.Filter<IUserGame> = {
    user: new mongoose.Types.ObjectId(userId),
  };
  if (status) filter.status = status as IUserGame["status"];

  // Aggregation pipeline for efficient filtering and pagination
  const pipeline: PipelineStage[] = [
    { $match: filter as Record<string, unknown> }, // Filter by user and status first (performance)
    {
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game",
      },
    },
    { $unwind: "$game" },
  ];

  // Text search on game fields
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { "game.title": { $regex: query, $options: "i" } },
          { "game.publisher": { $regex: query, $options: "i" } },
          { "game.developer": { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // Filter by game properties
  if (genre) pipeline.push({ $match: { "game.genre": genre } });
  if (platform) pipeline.push({ $match: { "game.platforms": platform } });

  // Count total BEFORE pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await UserGame.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  // Clamp page to valid range
  const clampedPage = Math.min(validPage, totalPages || 1);

  // Deterministic sorting (always include _id for consistency)
  const sortField = sortBy || "updatedAt";
  const sortOrder = order === "asc" ? 1 : -1;
  pipeline.push({ $sort: { [sortField]: sortOrder, _id: 1 } });

  // Pagination with clamped page
  pipeline.push({ $skip: (clampedPage - 1) * limit });
  pipeline.push({ $limit: limit });

  const items = await UserGame.aggregate(pipeline);

  // Return format matching Catalog pattern
  return {
    data: items,
    pagination: {
      total,
      pages: totalPages,
      page: clampedPage,
      limit,
    },
  };
};

// Update collection item
// Destination: Used by CollectionController.updateItem (src/controllers/collection.controller.ts).
export const updateCollectionItem = async (
  itemId: string,
  userId: string,
  updateData: Partial<IUserGame>
): Promise<IUserGame> => {
  const item = await UserGame.findOneAndUpdate(
    { _id: itemId, user: userId },
    updateData,
    { new: true }
  ).populate("game");

  if (!item) throw new AppError("Item no encontrado en tu colección", 404);
  return item;
};

// Remove from collection
// Destination: Used by CollectionController.removeItem (src/controllers/collection.controller.ts).
export const removeFromCollection = async (
  itemId: string,
  userId: string
): Promise<IUserGame> => {
  const item = await UserGame.findOneAndDelete({ _id: itemId, user: userId });
  if (!item) throw new AppError("Item not found in your collection", 404);
  return item;
};
