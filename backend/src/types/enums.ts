/**
 * enums.ts
 * Centralized enums for the application to avoid magic strings.
 * Ensures type safety and consistency across models, services, and controllers.
 * Exported to models and used throughout the application.
 */

/**
 * UserRole Enum
 * Defines user access levels for role-based access control (RBAC).
 * - ADMIN: Full access to all features including game management
 * - USER: Standard user with access to catalog, wishlist, and purchases
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

/**
 * GameStatus Enum
 * Tracks a user's progress with games in their library.
 * Used in UserGame model to categorize game completion status.
 * - PLAYING: Currently actively playing
 * - COMPLETED: Finished the game
 * - DROPPED: Started but abandoned
 * - PLAN_TO_PLAY: In backlog, planning to play
 * - PENDING: Purchased but not yet started
 */
export enum GameStatus {
  PLAYING = "playing",
  COMPLETED = "completed",
  DROPPED = "dropped",
  PLAN_TO_PLAY = "plan_to_play",
  PENDING = "pending",
}

/**
 * OrderStatus Enum
 * Tracks the lifecycle of purchase orders.
 * Used in Order model to manage payment and fulfillment states.
 * - PENDING: Payment initiated but not confirmed
 * - COMPLETED: Payment successful, license keys delivered
 * - REFUNDED: Payment reversed, order cancelled
 * - FAILED: Payment failed or rejected
 */
export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REFUNDED = "refunded",
  FAILED = "failed",
}
