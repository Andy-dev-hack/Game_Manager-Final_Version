/**
 * @file collection.schema.ts
 * @description Zod validation schemas for user collection management.
 * Destination: Used by collection.routes.ts via zod.middleware.ts
 */

import { z } from "zod";
import { GameStatus } from "../../types/enums";

/**
 * Schema for adding a game to collection
 * Destination: POST /api/collection
 */
export const addToCollectionSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  status: z.nativeEnum(GameStatus).optional(),
  hoursPlayed: z.number().min(0, "Hours played cannot be negative").optional(),
  score: z.number().min(0).max(10, "Score must be between 0 and 10").optional(),
  review: z.string().optional(),
});

/**
 * Schema for updating a collection item
 * Destination: PUT /api/collection/:id
 */
export const updateCollectionItemSchema = z.object({
  status: z.nativeEnum(GameStatus).optional(),
  hoursPlayed: z.number().min(0, "Hours played cannot be negative").optional(),
  score: z.number().min(0).max(10, "Score must be between 0 and 10").optional(),
  review: z.string().optional(),
});

// Types
export type AddToCollectionSchemaType = z.infer<typeof addToCollectionSchema>;
export type UpdateCollectionItemSchemaType = z.infer<
  typeof updateCollectionItemSchema
>;
