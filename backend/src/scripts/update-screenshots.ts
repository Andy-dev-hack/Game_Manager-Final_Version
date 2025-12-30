/**
 * @file update-screenshots.ts
 * @description Migration script to update all games to have 6 screenshots instead of 5.
 * Fetches screenshots from RAWG API and updates MongoDB.
 * Includes backup, progress logging, retry logic, and error handling.
 *
 * Usage: npm run update-screenshots
 */

import mongoose from "mongoose";
import Game from "../models/game.model";
import { getScreenshots } from "../services/rawg.service";
import logger from "../utils/logger";
import { MONGO_URI } from "../config/env";

// Delay function to avoid RAWG rate limits
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) {
        // Last retry failed
        return null;
      }
      // Exponential backoff: 1s, 2s, 4s
      const waitTime = baseDelay * Math.pow(2, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  return null;
}

async function updateScreenshots() {
  try {
    // Connect to MongoDB
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    logger.info("✅ Connected to MongoDB");

    // Get all games with rawgId
    const games = await Game.find({ rawgId: { $exists: true, $ne: null } });
    logger.info(`Found ${games.length} games to update`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const progress = `[${i + 1}/${games.length}]`;

      try {
        logger.info(
          `${progress} Processing: ${game.title} (RAWG ID: ${game.rawgId})`
        );

        // Backup old screenshots
        const oldScreenshots = game.screenshots || [];

        // Fetch new screenshots from RAWG with retry logic
        const newScreenshots = await retryWithBackoff(
          () => getScreenshots(game.rawgId!),
          3,
          2000 // 2 second base delay
        );

        if (!newScreenshots || newScreenshots.length === 0) {
          // RAWG failed after retries - use fallback strategy
          if (oldScreenshots.length >= 5) {
            // Duplicate the last screenshot to reach 6
            const fallbackScreenshots = [
              ...oldScreenshots,
              oldScreenshots[oldScreenshots.length - 1],
            ];

            await Game.findByIdAndUpdate(game._id, {
              screenshots: fallbackScreenshots,
              screenshots_backup_5: oldScreenshots,
            });

            logger.warn(
              `${progress} ⚠️  RAWG unavailable, used fallback for ${game.title}: ${oldScreenshots.length} → ${fallbackScreenshots.length} (duplicated last)`
            );
            fallbackCount++;
            continue;
          } else {
            logger.warn(
              `${progress} ⚠️  No screenshots and no fallback for ${game.title}, skipping`
            );
            skippedCount++;
            continue;
          }
        }

        // Update game with new screenshots and backup
        await Game.findByIdAndUpdate(game._id, {
          screenshots: newScreenshots,
          screenshots_backup_5: oldScreenshots,
        });

        logger.info(
          `${progress} ✅ Updated ${game.title}: ${oldScreenshots.length} → ${newScreenshots.length} screenshots`
        );
        successCount++;

        // Delay to avoid RAWG rate limits (500ms between requests)
        if (i < games.length - 1) {
          await delay(500);
        }
      } catch (error) {
        logger.error(`${progress} ❌ Error updating ${game.title}: ${error}`);
        errorCount++;
        // Continue with next game even if one fails
      }
    }

    // Summary
    logger.info("\n" + "=".repeat(50));
    logger.info("📊 Migration Summary:");
    logger.info(`Total games: ${games.length}`);
    logger.info(`✅ Successfully updated from RAWG: ${successCount}`);
    logger.info(`⚠️  Updated with fallback (duplicated): ${fallbackCount}`);
    logger.info(`⚠️  Skipped (no screenshots): ${skippedCount}`);
    logger.info(`❌ Errors: ${errorCount}`);
    logger.info("=".repeat(50) + "\n");

    if (fallbackCount > 0) {
      logger.warn(
        `⚠️  ${fallbackCount} games used fallback (duplicated last screenshot). ` +
          `Run this script again when RAWG API is available to get real 6th screenshots.`
      );
    }

    if (errorCount > 0) {
      logger.warn(
        "⚠️  Some games failed to update. Check logs above for details."
      );
    } else if (fallbackCount === 0) {
      logger.info("🎉 All games updated successfully with real screenshots!");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

// Run the migration
updateScreenshots();
