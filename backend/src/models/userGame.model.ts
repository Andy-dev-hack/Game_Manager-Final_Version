/**
 * userGame.model.ts
 * Mongoose model for user's personal game collection (library).
 * Links users to games they own with personal metadata (status, playtime, reviews).
 * Implements cascade delete when user is removed.
 */
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IGame } from "./game.model";
import { GameStatus } from "../types/enums";

// Re-exported for backward compatibility with existing imports
export { GameStatus };

/**
 * IUserGame Interface
 * Represents a game in a user's personal library with tracking metadata.
 * Tracks ownership, playtime, completion status, and user ratings/reviews.
 */
export interface IUserGame extends Document {
  user: IUser["_id"]; // Reference to User who owns this game
  game: IGame["_id"]; // Reference to Game in global catalog
  hoursPlayed: number; // Total hours user has played
  status: GameStatus; // PENDING, PLAYING, COMPLETED, or ABANDONED
  isFavorite: boolean; // Whether user marked as favorite
  score?: number; // User's personal rating (0-10)
  review?: string; // User's written review
  isOwned: boolean; // Whether user actually owns the game (vs wishlist)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UserGame Schema
 * Defines the structure for user's game library entries.
 * Automatically adds timestamps for tracking when games were added/updated.
 */
const userGameSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    hoursPlayed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.PENDING,
    },
    isFavorite: { type: Boolean, default: false },
    score: { type: Number, min: 0, max: 10 },
    review: { type: String },
    isOwned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

/**
 * Unique Constraint Index
 * Prevents a user from having duplicate entries for the same game.
 * Each user can only have one library entry per game.
 */
userGameSchema.index({ user: 1, game: 1 }, { unique: true });

// Exported to collection controller and service for library management operations
const UserGame = mongoose.model<IUserGame>("UserGame", userGameSchema);

export default UserGame;
