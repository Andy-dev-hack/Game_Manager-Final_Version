/**
 * @file pagination.validator.ts
 * @description Zod schemas for pagination query parameters
 * Provides validation for Library and Wishlist pagination endpoints
 */
import { z } from "zod";

/**
 * Library pagination query schema
 * Validates query parameters for GET /api/collection
 * @destination Used in collection.routes.ts middleware
 */
export const libraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  query: z.string().optional(),
  status: z.enum(["playing", "completed", "backlog"]).optional(),
  genre: z.string().optional(),
  platform: z.string().optional(),
  sortBy: z
    .enum(["title", "updatedAt", "price"])
    .optional()
    .default("updatedAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Wishlist pagination query schema
 * Validates query parameters for GET /api/users/wishlist
 * @destination Used in user.routes.ts middleware
 */
export const wishlistQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  query: z.string().optional(),
  genre: z.string().optional(),
  platform: z.string().optional(),
  sortBy: z.enum(["title", "price", "releaseDate"]).optional().default("title"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Exported to collection.routes.ts and user.routes.ts for request validation
