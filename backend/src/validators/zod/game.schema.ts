/**
 * @file game.schema.ts
 * @description Zod validation schemas for game management.
 * Destination: Used by game.routes.ts via zod.middleware.ts
 */

import { z } from "zod";

/**
 * Schema for creating a new game manually
 * Destination: POST /api/games
 */
export const createGameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  platform: z.string().min(1, "Platform is required"),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  price: z
    .preprocess(
      (val) => Number(val),
      z.number().min(0, "Price must be positive")
    )
    .optional(),
  score: z
    .preprocess((val) => Number(val), z.number().min(0).max(100))
    .optional(),
});

/**
 * Schema for updating an existing game
 * Destination: PUT /api/games/:id
 */
export const updateGameSchema = createGameSchema.partial();

/**
 * Schema for searching games in the catalog
 * Destination: GET /api/games
 */
export const searchGameSchema = z.object({
  query: z.string().trim().optional(),
  page: z
    .preprocess(
      (val) => (val ? parseInt(String(val)) : 1),
      z.number().min(1, "Page must be a positive integer")
    )
    .optional(),
  limit: z
    .preprocess(
      (val) => (val ? parseInt(String(val)) : 10),
      z.number().min(1).max(100)
    )
    .optional(),
  genre: z.string().trim().optional(),
  platform: z.string().trim().optional(),
  sortBy: z
    .enum([
      "price",
      "releaseDate",
      "title",
      "genre",
      "platform",
      "score",
      "discount",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  maxPrice: z
    .preprocess(
      (val) => Number(val),
      z.number().min(0, "Price must be positive")
    )
    .optional(),
  onSale: z.enum(["true", "false"]).optional(),
  developer: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
});

/**
 * Schema for searching games in external API (RAWG)
 * Destination: GET /api/games/search
 */
export const searchExternalSchema = z.object({
  q: z.string().min(1, "Search query is required").trim(),
});

/**
 * Schema for creating a game from RAWG ID
 * Destination: POST /api/games/from-rawg
 */
export const createFromRAWGSchema = z.object({
  rawgId: z.number().int(),
  steamAppId: z.number().int().optional(),
});

// Types
export type CreateGameSchemaType = z.infer<typeof createGameSchema>;
export type UpdateGameSchemaType = z.infer<typeof updateGameSchema>;
export type SearchGameSchemaType = z.infer<typeof searchGameSchema>;
export type SearchExternalSchemaType = z.infer<typeof searchExternalSchema>;
export type CreateFromRAWGSchemaType = z.infer<typeof createFromRAWGSchema>;
