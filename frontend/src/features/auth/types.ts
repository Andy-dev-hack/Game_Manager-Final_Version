/**
 * types.ts
 * TypeScript interfaces for authentication-related data structures.
 * Defines User, AuthResponse, and credential types used throughout the auth feature.
 * Ensures type safety for authentication operations.
 */

/**
 * User interface
 * Represents an authenticated user in the system
 */
export interface User {
  _id: string;
  email: string;
  username: string;
  role: "user" | "admin"; // User role for authorization
  avatar?: string; // Optional profile picture URL
  createdAt: string;
}

/**
 * AuthResponse interface
 * Response structure from login/register endpoints
 */
export interface AuthResponse {
  message: string;
  token: string; // JWT access token for authentication
  refreshToken: string; // Refresh token for obtaining new access tokens
  user: User; // User data
}

/**
 * LoginCredentials interface
 * Required fields for user login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * RegisterCredentials interface
 * Required fields for user registration
 */
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Exported to auth services, context, and components for type safety
