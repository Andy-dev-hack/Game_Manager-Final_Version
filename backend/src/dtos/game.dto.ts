/**
 * @file game.dto.ts
 * @description Data Transfer Objects for game catalog operations.
 * Defines interfaces for creating and updating games in the global catalog.
 */
export interface CreateGameDto {
  title: string;
  genre: string;
  platform: string;
  developer?: string;
  publisher?: string;
  image?: string;
  score?: number;
  price?: number;
  currency?: string;
}

export interface UpdateGameDto {
  title?: string;
  genre?: string;
  platform?: string;
  developer?: string;
  publisher?: string;
  image?: string;
  score?: number;
  price?: number;
  currency?: string;
}
