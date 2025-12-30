/**
 * game.model.ts
 * Mongoose model for the global game catalog.
 * Aggregates data from RAWG API (metadata, screenshots) and Steam API (pricing).
 * Supports multi-currency pricing and full-text search across multiple fields.
 */
import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * IGame Interface
 * Represents a game in the global catalog with combined RAWG and Steam data.
 */
export interface IGame {
  _id: Types.ObjectId;
  // Core game information
  title: string;
  genres: string[];
  platforms: string[];
  developer?: string;
  publisher?: string;
  image?: string;
  score?: number;

  // RAWG API fields - Game metadata and media
  rawgId?: number; // RAWG database identifier
  description?: string; // Game description from RAWG
  released?: Date; // Release date
  metacritic?: number; // Metacritic score (0-100)
  screenshots?: string[]; // Array of screenshot URLs

  // Steam API fields - Pricing information
  steamAppId?: number; // Steam store identifier
  price?: number; // Current price
  currency?: string; // Price currency code
  discount?: number; // Discount percentage (0-100)
  onSale?: boolean; // Whether game is currently on sale
  originalPrice?: number; // Original price before discount

  // Multi-currency support for international pricing
  prices?: {
    usd?: number;
    eur?: number;
  };
  originalPrices?: {
    usd?: number;
    eur?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export type GameDocument = IGame & Document;

const gameSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  genres: {
    type: [String],
    required: true,
    default: [],
  },
  platforms: {
    type: [String],
    required: true,
    default: [],
  },
  developer: {
    type: String,
    required: false,
    trim: true,
  },
  publisher: {
    type: String,
    required: false,
    trim: true,
  },
  image: {
    type: String,
    required: false,
    trim: true,
  },
  score: {
    type: Number,
    required: false,
    min: 0,
    max: 10,
  },
  // RAWG API fields
  rawgId: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  released: {
    type: Date,
    required: false,
  },
  metacritic: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  screenshots: {
    type: [String],
    required: false,
    default: [],
  },
  // Steam API fields
  steamAppId: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    min: 0,
  },
  currency: {
    type: String,
    required: false,
  },
  discount: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  onSale: {
    type: Boolean,
    required: false,
    default: false,
  },
  originalPrice: {
    type: Number,
    required: false,
    min: 0,
  },
  // Multi-currency support
  prices: {
    usd: { type: Number, required: false },
    eur: { type: Number, required: false },
  },
  originalPrices: {
    usd: { type: Number, required: false },
    eur: { type: Number, required: false },
  },
});

/**
 * Text Search Index
 * Enables full-text search across multiple game fields with weighted relevance.
 * Weights prioritize: title (10) > genre (5) > developer/publisher (3) > platform (1)
 * Used by catalog search functionality to find games by any text field.
 */
gameSchema.index(
  {
    title: "text",
    genres: "text",
    developer: "text",
    publisher: "text",
    platforms: "text",
  },
  {
    weights: {
      title: 10,
      genres: 5,
      developer: 3,
      publisher: 3,
      platforms: 1,
    },
    name: "GameTextIndex",
  }
);

/**
 * Unique Constraint Index
 * Prevents duplicate games in the catalog based on title.
 * Same game entry now contains all its platforms.
 */
gameSchema.index({ title: 1 }, { unique: true });

// Exported to controllers and services for game catalog operations
const Game = mongoose.model<GameDocument>("Game", gameSchema);

export default Game;
