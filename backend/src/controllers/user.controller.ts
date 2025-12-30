/**
 * @file user.controller.ts
 * @description Controller for user-specific operations like wishlist management.
 * Delegates all logic to UserService. Pure HTTP layer.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addToWishlist as addToWishlistService,
  removeFromWishlist as removeFromWishlistService,
  getWishlist as getWishlistService,
} from "../services/user.service";
import { AppError } from "../utils/AppError";

/**
 * Add a game to the user's wishlist
 * @route POST /api/users/wishlist/:gameId
 */
export const addToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId } = req.params;
    const userId = req.userData?.id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const result = await addToWishlistService(userId, gameId);
    res.status(200).json(result);
  }
);

/**
 * Remove a game from the user's wishlist
 * @route DELETE /api/users/wishlist/:gameId
 */
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId } = req.params;
    const userId = req.userData?.id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const result = await removeFromWishlistService(userId, gameId);
    res.status(200).json(result);
  }
);

/**
 * Get user's wishlist with pagination, search, and filters
 * @route GET /api/users/wishlist
 */
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const { page, limit, query, genre, platform, sortBy, order } = req.query;

  const params = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 12,
    query: query as string,
    genre: genre as string,
    platform: platform as string,
    sortBy: sortBy as string,
    order: order as "asc" | "desc",
  };

  const result = await getWishlistService(
    userId,
    params.page,
    params.limit,
    params.query,
    params.genre,
    params.platform,
    params.sortBy,
    params.order
  );

  res.status(200).json(result);
});
