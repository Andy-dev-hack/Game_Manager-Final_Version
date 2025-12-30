import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";

// Load environment variables
dotenv.config();

const repairGenres = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Find Reference Game
    const referenceGameName = "Total War: SHOGUN 2";
    const referenceGame = await Game.findOne({ title: referenceGameName });

    if (!referenceGame) {
      console.error(`❌ Reference game '${referenceGameName}' not found!`);
      process.exit(1);
    }

    if (!referenceGame.genres || referenceGame.genres.length === 0) {
      console.error(
        `❌ Reference game '${referenceGameName}' has no genres! Cannot use as template.`
      );
      process.exit(1);
    }

    const targetGenres = referenceGame.genres;
    console.log(
      `✅ Found template genres from '${referenceGameName}':`,
      targetGenres
    );

    // 2. Find Broken Games (Empty Genres)
    // We look for games where genres array is empty or does not exist
    const query = {
      $or: [{ genres: { $exists: false } }, { genres: { $size: 0 } }],
    };

    const brokenGamesCount = await Game.countDocuments(query);
    console.log(`📊 Found ${brokenGamesCount} games with missing genres.`);

    if (brokenGamesCount === 0) {
      console.log("✅ No broken games found. Nothing to repair.");
      process.exit(0);
    }

    // 3. Update
    const result = await Game.updateMany(query, {
      $set: { genres: targetGenres },
    });

    console.log(`🛠️ Repaired ${result.modifiedCount} games.`);
    console.log(`✅ Applied genres: ${targetGenres.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Repair Script Error:", error);
    process.exit(1);
  }
};

repairGenres();
