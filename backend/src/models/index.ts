/**
 * index.ts
 * Central barrel export for all Mongoose models and types.
 * Simplifies imports across the application by providing a single import point.
 * Example: import { User, Game, IUser, IGame } from '../models'
 */

// User model and interface - for authentication and profile management
export { default as User } from "./user.model";
export type { IUser } from "./user.model";

// Game model and interface - for global game catalog
export { default as Game } from "./game.model";
export type { IGame } from "./game.model";

// UserGame model and interface - for user's personal game library
export { default as UserGame } from "./userGame.model";
export type { IUserGame } from "./userGame.model";

// Order model and interface - for purchase orders
export { default as Order } from "./order.model";
export type { IOrder } from "./order.model";

// Enums used across models (UserRole, GameStatus, OrderStatus)
export * from "../types/enums";
