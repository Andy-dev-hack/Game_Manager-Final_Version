import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";
import fs from "fs";
import path from "path";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/game_manager_db";

const seedGames = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Seeding (Short)...");

    const gamesPath = path.join(__dirname, "../../data/games.short.json");
    let gamesData = JSON.parse(fs.readFileSync(gamesPath, "utf-8"));

    // Transform 'platform' string to 'platforms' array if it exists
    gamesData = gamesData.map((game: any) => {
      if (typeof game.platform === "string") {
        return { ...game, platforms: [game.platform], platform: undefined }; // Remove old 'platform' field
      }
      return game;
    });

    // Optional: Clear existing games to visually verify only these exist,
    // BUT user might want to keep others.
    // The user just wants to see it works.
    // I will use upsert as before.

    for (const game of gamesData) {
      await Game.findOneAndUpdate({ title: game.title }, game, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      });
      console.log(`Seeded/Updated: ${game.title}`);
    }

    console.log("Seeding (Short) Completed Successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedGames();
