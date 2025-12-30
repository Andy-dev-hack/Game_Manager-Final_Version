/**
 * @file stats.dto.ts
 * @description Data Transfer Object (DTO) definitions for statistics-related operations.
 * Defines the shape of the data returned by the stats endpoint.
 */

/**
 * StatsResponseDto
 * Represents the global statistics returned to the public homepage.
 */
export interface StatsResponseDto {
  totalUsers: number;
  totalGames: number;
  totalCollections: number; // Represents the total number of games owned across all users (UserGame documents)
}
