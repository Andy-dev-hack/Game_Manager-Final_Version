/**
 * @file user.dto.ts
 * @description Standard Data Transfer Objects for User operations.
 * Defines interfaces for inputs and standardized responses for the User Service.
 */

import { Types } from "mongoose";
import { IGame } from "../models/game.model";

/**
 * Interface for Wishlist Response
 * Used when returning the wishlist array or operation results
 */
export interface WishlistResponseDto {
  message?: string;
  wishlist: Types.ObjectId[];
}

/**
 * Interface for Add/Remove Wishlist Params
 * Although usually from URL params, defining checks here helps consistency.
 */
export interface WishlistOperationDto {
  userId: string;
  gameId: string;
}

/**
 * Interface for Paginated Users Response
 * Used when returning paginated list of users (admin)
 */
export interface PaginatedUsersDto {
  users: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Interface for Paginated Wishlist Response (Populated)
 */
export interface PaginatedWishlistDto {
  data: IGame[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}
