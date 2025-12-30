/**
 * @file discovery.dto.ts
 * @description Data Transfer Objects for the Discovery Service.
 * Defines the UnifiedGame interface that standardizes Local and Remote games.
 */
import { Types } from "mongoose";

/**
 * Unified Game Object
 * A safe subset of properties common to both Local (MongoDB) and Remote (RAWG) games.
 * Used by the Frontend to render GameCards without knowing the source.
 */
export interface UnifiedGame {
  _id: string; // MongoDB ObjectId (Local) OR "rawg-{id}" (Remote)
  title: string;
  image: string;
  price?: number; // Only for Local games (or fetched external ones)
  currency?: string;
  genres: string[]; // [FIX] Corrected to array to match Mongoose Schema
  stats?: {
    score?: number;
    rating?: number;
  };

  developer?: string;
  publisher?: string;

  // Critical Flags
  isExternal: boolean; // TRUE = From RAWG (Needs import), FALSE = Local
  inLibrary: boolean; // TRUE = User owns it permissions check

  // Metadata for Import
  rawgId?: number; // Required for "Hydration" (Import)
  platforms?: string[];
}

export interface DiscoveryResponse {
  results: UnifiedGame[];
  source: "mixed" | "local" | "remote";
}
