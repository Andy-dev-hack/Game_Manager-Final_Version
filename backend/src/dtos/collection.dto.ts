/**
 * @file collection.dto.ts
 * @description Data Transfer Objects for user collection operations.
 * Defines interfaces for adding and updating games in a user's collection.
 */
import { GameStatus } from "../models/userGame.model";

export interface AddToCollectionDto {
  gameId: string;
  status?: GameStatus;
  hoursPlayed?: number;
  isFavorite?: boolean;
  score?: number;
  review?: string;
}

export interface UpdateCollectionItemDto {
  status?: GameStatus;
  hoursPlayed?: number;
  isFavorite?: boolean;
  score?: number;
  review?: string;
}
