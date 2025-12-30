/**
 * @file collection.controller.ts
 * @description Handles HTTP requests for the user's personal game collection.
 * Requires authentication to identify the user.
 */
import { Request, Response } from "express";
import {
  addToCollection as addToCollectionService,
  getCollection as getCollectionService,
  updateCollectionItem,
  removeFromCollection,
} from "../services/collection.service";
import {
  AddToCollectionDto,
  UpdateCollectionItemDto,
} from "../dtos/collection.dto";
import { asyncHandler } from "../utils/asyncHandler";

// Destination: Used in src/routes/collection.routes.ts (POST /).
// Endpoint: POST /api/collection
// Adds a game to the authenticated user's collection.
export const addToCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userData?.id;
    if (!userId) throw new Error("User ID not found in token");

    const { gameId, ...data }: AddToCollectionDto = req.body;
    const item = await addToCollectionService(userId, gameId, data);
    res.status(201).json({ message: "Juego añadido a tu colección", item });
  }
);

// Destination: Used in src/routes/collection.routes.ts (GET /).
// Endpoint: GET /api/collection
// Retrieves the user's collection with pagination, search, and filters.
export const getCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userData!.id;
    const { page, limit, query, status, genre, platform, sortBy, order } =
      req.query;

    const params = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 12,
      query: query as string,
      status: status as string,
      genre: genre as string,
      platform: platform as string,
      sortBy: sortBy as string,
      order: order as "asc" | "desc",
    };

    const collection = await getCollectionService(
      userId,
      params.page,
      params.limit,
      params.query,
      params.status,
      params.genre,
      params.platform,
      params.sortBy,
      params.order
    );
    res.json(collection);
  }
);

// Destination: Used in src/routes/collection.routes.ts (PUT /:id).
export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;
  if (!userId) throw new Error("User ID not found in token");

  const { id } = req.params;
  const updates: UpdateCollectionItemDto = req.body;
  const updatedItem = await updateCollectionItem(id, userId, updates);
  res.status(200).json({ message: "Item updated", item: updatedItem });
});

// Destination: Used in src/routes/collection.routes.ts (DELETE /:id).
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;
  if (!userId) throw new Error("User ID not found in token");

  const { id } = req.params;
  await removeFromCollection(id, userId);
  res.status(200).json({ message: "Juego eliminado de la colección" });
});
