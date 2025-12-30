/**
 * @file update-scores.ts
 * @description Backfill script to update missing scores for existing games.
 * Fetches ratings from RAWG and updates 'score' field (0-10 scale).
 * Updates both MongoDB and games.json to keep them in sync.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import { getGameDetails } from "../services/rawg.service";

dotenv.config();

const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");

// Helper to delay execution (avoid API rate limits)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runUpdate = async () => {
  logger.info("=".repeat(60));
  logger.info(`🚀 Starting Score Backfill`);
  logger.info("=".repeat(60));

  try {
    await connectDB();

    // Find games with missing or zero score
    // We treat null, undefined, or 0 as "missing" for this purpose
    const gamesToUpdate = await Game.find({
      $or: [{ score: { $exists: false } }, { score: null }, { score: 0 }],
      rawgId: { $ne: null }, // Must have RAWG ID to fetch data
    });

    logger.info(`📚 Found ${gamesToUpdate.length} games to update.`);

    if (gamesToUpdate.length === 0) {
      logger.info("✨ No games need updating.");
      process.exit(0);
    }

    let updatedCount = 0;
    const updatesMap = new Map<number, number>(); // rawgId -> newScore

    for (const game of gamesToUpdate) {
      try {
        if (!game.rawgId) continue;

        logger.info(
          `🔍 Fetching details for: ${game.title} (ID: ${game.rawgId})`
        );

        // Add delay to respect rate limits
        await delay(600);

        const details = await getGameDetails(game.rawgId);

        // Convert RAWG rating (0-5) to Score (0-10)
        // Round to nearest integer
        const newScore = details.rating ? Math.round(details.rating * 2) : 0;

        if (newScore > 0) {
          // Update MongoDB
          game.score = newScore;
          await game.save();

          updatesMap.set(game.rawgId, newScore);
          updatedCount++;
          logger.info(`✅ Updated ${game.title}: Score ${newScore}/10`);
        } else {
          logger.warn(`⚠️ No rating found for ${game.title}`);
        }
      } catch (err: any) {
        logger.error(`❌ Failed to process ${game.title}: ${err.message}`);
      }
    }

    // Update games.json
    if (updatedCount > 0) {
      logger.info(`\n💾 Syncing updates to games.json...`);
      try {
        const currentFileContent = await fs.readJson(GAMES_JSON_PATH);

        if (
          !Array.isArray(currentFileContent) ||
          currentFileContent.length === 0
        ) {
          logger.warn(
            "⚠️ games.json seems empty or invalid. Skipping JSON update."
          );
        } else {
          let jsonUpdates = 0;
          const updatedContent = currentFileContent.map((item: any) => {
            if (item.rawgId && updatesMap.has(item.rawgId)) {
              item.score = updatesMap.get(item.rawgId);
              jsonUpdates++;
            }
            return item;
          });

          await fs.writeJson(GAMES_JSON_PATH, updatedContent, { spaces: 4 });
          logger.info(
            `✅ games.json updated with ${jsonUpdates} score changes.`
          );
        }
      } catch (fileErr) {
        logger.error(`❌ Error updating games.json: ${fileErr}`);
      }
    }

    logger.info("\n" + "=".repeat(60));
    logger.info(`🏁 Update Finished`);
    logger.info(`✨ Successfully updated: ${updatedCount} games`);
    logger.info("=".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Fatal Error: ${error}`);
    process.exit(1);
  }
};

runUpdate();
