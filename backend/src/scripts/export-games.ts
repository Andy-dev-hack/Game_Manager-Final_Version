/**
 * @file export-games.ts
 * @description Exports all games from MongoDB to data/games.json
 * Useful for syncing DB state back to JSON file or fixing corruption.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");

const runExport = async () => {
  logger.info("=".repeat(60));
  logger.info("📦 Starting Games Export (DB -> JSON)");
  logger.info("=".repeat(60));

  try {
    await connectDB();

    const games = await Game.find({}).sort({ title: 1 }).lean();

    logger.info(`📚 Found ${games.length} games in MongoDB.`);

    // Transform for JSON (ObjectId to string, remove __v)
    const jsonGames = games.map((game: any) => {
      const { _id, __v, createdAt, updatedAt, id, ...rest } = game;
      return {
        _id: _id.toString(),
        ...rest,
        // Ensure price is number
        price: Number(game.price || 0),
        originalPrice: Number(game.originalPrice || 0),
        discount: Number(game.discount || 0),
      };
    });

    logger.info(`📝 Writing to ${GAMES_JSON_PATH}...`);
    await fs.writeJSON(GAMES_JSON_PATH, jsonGames, { spaces: 2 });

    logger.info("✅ Export completed successfully!");
    logger.info("=".repeat(60));
    process.exit(0);
  } catch (err: any) {
    logger.error(`❌ Export Failed: ${err.message}`);
    process.exit(1);
  }
};

runExport();
