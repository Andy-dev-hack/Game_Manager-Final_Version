/**
 * api.types.ts
 * Type definitions for API responses and errors
 */

/**
 * Standard API error response structure
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Type guard to check if error is an API error with response data
 * @param error - Unknown error object
 * @returns True if error has response.data structure
 */
export function isApiError(
  error: unknown
): error is { response: { data: ApiError } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as Record<string, unknown>).response === "object" &&
    (error as Record<string, unknown>).response !== null &&
    "data" in
      ((error as Record<string, unknown>).response as Record<string, unknown>)
  );
}

import type { Game } from "../services/games.service";

/**
 * Games API paginated response
 */
export interface GamesApiResponse {
  games: Game[];
  currentPage: number;
  totalPages: number;
  totalGames: number;
}

// Exported to services and error handling utilities
