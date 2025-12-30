/**
 * @file index.ts
 * @description Central export point for all DTOs.
 * Simplifies imports across the application.
 */
export * from "./auth.dto";
export * from "./game.dto";
export * from "./stats.dto";
export * from "./discovery.dto";
export type {
  WishlistResponseDto,
  WishlistOperationDto,
  PaginatedUsersDto,
} from "./user.dto";
