import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";
import { getGameDetails } from "../services/rawg.service";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const fixScreenshots = async () => {
  try {
    await connectDB();
    logger.info("Connected to DB for fix...");

    const gameId = "6942790a8c6eb5d301e03ad4";
    // Check if valid ObjectID, if not it might be a custom string ID or purely textual.
    // The user provided ID seems like a standard Mongo ID.

    const game = await Game.findById(gameId);

    if (!game) {
      logger.error(`Game with ID ${gameId} not found in DB.`);

      // Optional: Search by loose title if ID is wrong?
      // For now, let's assume ID is correct or we search for games with missing screenshots.
      const gamesMissingScreenshots = await Game.find({
        $or: [
          { "assets.screenshots": { $exists: false } },
          { "assets.screenshots": { $size: 0 } },
        ],
        rawgId: { $ne: null },
      }).limit(10);

      logger.info(
        `Found ${gamesMissingScreenshots.length} other games with missing screenshots.`
      );

      for (const g of gamesMissingScreenshots) {
        await updateGame(g);
      }
    } else {
      await updateGame(game);
    }

    logger.info("Fix process completed.");
    process.exit(0);
  } catch (error) {
    logger.error(`Error in fix script: ${error}`);
    process.exit(1);
  }
};

async function updateGame(game: any) {
  logger.info(`Processing game: ${game.title} (RAWG ID: ${game.rawgId})`);

  if (!game.rawgId) {
    logger.warn("Skipping game without RAWG ID.");
    return;
  }

  try {
    const details = await getGameDetails(game.rawgId);

    // Type assertion: getGameDetails returns the full RAWG response
    // We need to access the nested properties correctly
    if (
      (details as any).screenshots &&
      (details as any).screenshots.length > 0
    ) {
      game.assets.screenshots = (details as any).screenshots;
      if (!game.image && (details as any).image) {
        game.image = (details as any).image;
        game.assets.cover = (details as any).image;
      }
      // Also ensure title is correct if it was weird
      if (game.title === "common.free" && (details as any).title) {
        game.title = (details as any).title;
      }

      await game.save();
      logger.info(`✅ Updated screenshots for ${game.title}`);
    } else {
      logger.warn(`No screenshots found in RAWG for ${game.title}`);
    }
  } catch (err: any) {
    logger.error(`Failed to fetch details for ${game.title}: ${err.message}`);
  }
}

fixScreenshots();
