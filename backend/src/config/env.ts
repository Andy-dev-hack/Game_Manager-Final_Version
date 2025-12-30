/**
 * env.ts
 * Centralizes environment variable loading and validation.
 * Implements a "Fail-Fast" strategy: application crashes immediately if critical variables are missing.
 * Ensures all required configuration is present before application starts.
 */
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * getEnv
 * Strict validation function for environment variables.
 * Ensures critical configuration is present before application starts.
 * @param key - Environment variable name
 * @param defaultValue - Optional fallback value
 * @returns Environment variable value
 * @throws Error if variable is missing and no default provided
 */
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(
      `❌ FATAL ERROR: Environment variable ${key} is not defined.`
    );
  }
  return value;
};

/**
 * Exported Configuration Variables
 * Used throughout the application for server, database, and API configuration.
 * Exported to: server.ts, auth.service.ts, db.ts, rawg.service.ts, steam.service.ts
 */

// Server Configuration
export const PORT: string | number = process.env.PORT || 3500;

// Database Configuration
export const MONGO_URI: string = getEnv("MONGODB_URI", process.env.MONGO_URI);

// Authentication Configuration
export const JWT_SECRET: string = getEnv("JWT_SECRET");
export const JWT_EXPIRES_IN: string = "4h"; // Access token expiration
export const SALT_ROUNDS: number = 10; // bcrypt password hashing rounds

// External API Configuration
export const RAWG_API_KEY: string = getEnv(
  "RAWG_API_KEY",
  process.env.RAWG_API_KEY
);
