/**
 * db.ts
 * Handles MongoDB database connection using Mongoose.
 * Implements environment-based database selection and security checks.
 * Prevents accidental cross-contamination between test and production databases.
 */
import mongoose from "mongoose";
import logger from "../utils/logger";

/**
 * connectDB
 * Establishes connection to MongoDB with environment-specific database selection.
 * Implements critical safety checks to prevent test/production database mixing.
 * @throws Error if connection fails or security checks fail
 * Exported to server.ts for application startup and seed.ts for data seeding
 */
const connectDB = async (): Promise<void> => {
  try {
    // Configure Mongoose connection options
    const options: mongoose.ConnectOptions = {};

    // Use separate test database to prevent data corruption
    if (process.env.NODE_ENV === "test") {
      options.dbName = "game-manager-test";
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI as string,
      options
    );

    /**
     * Security Checks
     * Prevents accidental database cross-contamination:
     * 1. Tests must only use game-manager-test database
     * 2. Development/Production must never use test database
     */
    const connectedDB = conn.connection.name;
    const isTestEnv = process.env.NODE_ENV === "test";

    // Enforce test environment uses test database
    if (isTestEnv && connectedDB !== "game-manager-test") {
      throw new Error(
        `❌ SECURITY VIOLATION: Tests attempted to connect to NON-TEST database "${connectedDB}". Tests MUST use "game-manager-test".`
      );
    }

    // Prevent dev/prod from using test database
    if (!isTestEnv && connectedDB === "game-manager-test") {
      throw new Error(
        `❌ SECURITY VIOLATION: Development/Production environment attempted to connect to TEST database "${connectedDB}".`
      );
    }

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(err);
    process.exit(1); // Exit process if database connection fails
  }
};

// Exported to server.ts for application initialization
export default connectDB;
