/**
 * @file cleanTestUsers.ts
 * @description Script to delete garbage users created by integration tests.
 * Deletes users whose email or username starts with "admin_val" or contains "test".
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model";
import { MONGO_URI } from "../config/env";
import logger from "../utils/logger";

dotenv.config();

const cleanTestUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB for cleanup...");

    // Define criteria for "garbage" users
    // Adjust regex as needed based on what you see in DB
    const criteria = {
      $or: [
        { email: { $regex: /^admin_val/i } }, // Starts with admin_val
        { username: { $regex: /^admin_val/i } },
        { email: { $regex: /test\.com$/i } }, // Ends with test.com (common in tests)
      ],
    };

    // Count first
    const count = await User.countDocuments(criteria);

    if (count === 0) {
      logger.info("No test users found to delete.");
    } else {
      logger.info(`Found ${count} test users. Deleting...`);
      const result = await User.deleteMany(criteria);
      logger.info(`Successfully deleted ${result.deletedCount} users.`);
    }
  } catch (error) {
    logger.error(`Cleanup script error: ${error}`);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

cleanTestUsers();
