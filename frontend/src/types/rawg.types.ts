/**
 * rawg.types.ts
 * Type definitions for RAWG API responses
 * Based on RAWG API documentation
 */

/**
 * RAWG Game object from search/detail endpoints
 */
export interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  platforms: RAWGPlatform[];
  genres: RAWGGenre[];
  tags: RAWGTag[];
  short_screenshots: RAWGScreenshot[];
}

/**
 * Platform information
 */
export interface RAWGPlatform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * Genre information
 */
export interface RAWGGenre {
  id: number;
  name: string;
  slug: string;
}

/**
 * Tag information
 */
export interface RAWGTag {
  id: number;
  name: string;
  slug: string;
}

/**
 * Screenshot information
 */
export interface RAWGScreenshot {
  id: number;
  image: string;
}

/**
 * RAWG search response with pagination
 */
export interface RAWGSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

// Exported to admin services and pages for RAWG API integration
