/**
 * @file manual-cleanup.ts
 * @description Script to manually trigger the database cleanup tasks usually run by cron.
 * Useful for maintenance or freeing up space on demand.
 *
 * Usage: npx ts-node src/scripts/manual-cleanup.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import {
  cleanupExpiredTokens,
  cleanupPendingOrders,
} from "../services/cron.service";
import logger from "../utils/logger";

dotenv.config();

const run = async () => {
  try {
    logger.info("Starting Manual Cleanup Script...");
    await connectDB();

    logger.info("--> Executing Token Cleanup...");
    await cleanupExpiredTokens();

    logger.info("--> Executing Pending Order Cleanup...");
    await cleanupPendingOrders();

    logger.info("Manual Cleanup Completed Successfully.");
    process.exit(0);
  } catch (error) {
    logger.error(`Manual Cleanup Failed: ${error}`);
    process.exit(1);
  }
};

run();
