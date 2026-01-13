/**
 * @file user.service.ts
 * @description Service layer for User operations.
 * Handles business logic for wishlist management and user data retrieval.
 * strictly decouples DB operations from HTTP controllers.
 */

import mongoose, { Types } from "mongoose";
import User from "../models/user.model";
import Game, { IGame } from "../models/game.model";
import { AppError } from "../utils/AppError";
import { WishlistResponseDto, PaginatedWishlistDto } from "../dtos/user.dto";

/**
 * Adds a game to the user's wishlist.
 * Checks for existence of User and Game, and prevents duplicates.
 *
 * @param userId - The ID of the user
 * @param gameId - The ID of the game to add
 * @returns {Promise<WishlistResponseDto>} Updated wishlist
 * @throws {AppError} If user/game not found or already in wishlist
 */
export const addToWishlist = async (
  userId: string,
  gameId: string
): Promise<WishlistResponseDto> => {
  // 1. Validate User
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Validate Game (Ensure it exists in catalog)
  const game = await Game.findById(gameId);
  if (!game) {
    throw new AppError("Game not found", 404);
  }

  // 3. Check for duplicates
  // Using string comparison for safety with ObjectIds
  const isAlreadyAdded = user.wishlist.some(
    (id) => id.toString() === gameId.toString()
  );

  if (isAlreadyAdded) {
    throw new AppError("Game already in wishlist", 400);
  }

  // 4. Update Wishlist
  user.wishlist.push(new Types.ObjectId(gameId));
  await user.save();

  return {
    message: "Game added to wishlist",
    wishlist: user.wishlist,
  };
};

/**
 * Removes a game from the user's wishlist.
 *
 * @param userId - The ID of the user
 * @param gameId - The ID of the game to remove
 * @returns {Promise<WishlistResponseDto>} Updated wishlist
 * @throws {AppError} If user not found
 */
export const removeFromWishlist = async (
  userId: string,
  gameId: string
): Promise<WishlistResponseDto> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Filter out the game
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== gameId.toString()
  );

  await user.save();

  return {
    message: "Game removed from wishlist",
    wishlist: user.wishlist,
  };
};

/**
 * Retrieves the user's wishlist with server-side pagination and search.
 * Populates the game details with filtering and sorting support.
 *
 * @param userId - The ID of the user
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 12)
 * @param query - Search query for title/publisher/developer
 * @param genre - Filter by genre
 * @param platform - Filter by platform
 * @param sortBy - Sort field (default: 'title')
 * @param order - Sort order (default: 'asc')
 * @returns {Promise<PaginatedWishlistDto>} Paginated wishlist with pagination metadata
 * @throws {AppError} If user not found
 */
export const getWishlist = async (
  userId: string,
  page: number = 1,
  limit: number = 12,
  query?: string,
  genre?: string,
  platform?: string,
  sortBy?: string,
  order?: "asc" | "desc"
): Promise<PaginatedWishlistDto> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Build filter for populate match
  const filter: mongoose.mongo.Filter<IGame> = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { publisher: { $regex: query, $options: "i" } },
      { developer: { $regex: query, $options: "i" } },
    ];
  }
  if (genre) filter.genre = genre;
  if (platform) filter.platforms = platform;

  // Get total count
  const totalUser = await User.findById(userId).populate({
    path: "wishlist",
    match: filter,
  });
  const total = totalUser?.wishlist.length || 0;
  const totalPages = Math.ceil(total / limit);

  // Clamp page to valid range
  const validPage = Math.max(1, Math.min(page, totalPages || 1));

  // Get paginated data with sorting
  const sortField = sortBy || "title";
  const sortOrder = order === "asc" ? 1 : -1;

  const paginatedUser = await User.findById(userId).populate({
    path: "wishlist",
    match: filter,
    options: {
      sort: { [sortField]: sortOrder, _id: 1 },
      skip: (validPage - 1) * limit,
      limit,
    },
  });

  // Return format matching Catalog pattern
  return {
    data: (paginatedUser?.wishlist as unknown as IGame[]) || [],
    pagination: {
      total,
      pages: totalPages,
      page: validPage,
      limit,
    },
  };
};
