/**
 * @file seed.ts
 * @description Database seeding script for games.
 * Reads from data/games.json and upserts into the database.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";

dotenv.config();

const seedGames = async () => {
  try {
    await connectDB();

    logger.info("📖 Reading games data...");
    const gamesPath = path.join(process.cwd(), "data", "games.json");
    const gamesData = await fs.readJson(gamesPath);

    logger.info(`🌱 Seeding ${gamesData.length} Games (Upsert)...`);

    logger.info("🧹 Clearing Games Collection...");
    await Game.deleteMany({}); // Clear existing data

    logger.info(`🌱 Seeding ${gamesData.length} Games (InsertMany)...`);

    // Optional: Remove _id if you want fresh IDs, or keep them if preserving.
    // Assuming JSON contains valid data.

    // Sanitize prices before insertion (fix for 4000 -> 40.00)
    const sanitizedGames = gamesData.map((g: any) => {
      if (g.price && g.price > 100) g.price = g.price / 100;
      if (g.originalPrice && g.originalPrice > 100)
        g.originalPrice = g.originalPrice / 100;
      return g;
    });

    await Game.insertMany(sanitizedGames);

    logger.info("✅ Game Catalog Seeded Successfully (No data deleted)!");
    process.exit();
  } catch (error) {
    logger.error(`❌ Error seeding games: ${error}`);
    process.exit(1);
  }
};

seedGames();
