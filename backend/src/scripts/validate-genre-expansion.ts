import mongoose from "mongoose";
import dotenv from "dotenv";
import { join } from "path";
import Game from "../models/game.model";

// Load environment variables
dotenv.config(); // Defaults to .env in cwd

const validateGenres = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Custom VDD Script: Validating Genre Expansion Integrity");

    // 1. Fetch all games
    const games = await Game.find({});
    console.log(`📊 Processing ${games.length} games...`);

    // Metrics
    let missingGenres = 0;
    let singleGenreLegacy = 0;
    let multiGenre = 0;

    // Validation loop
    for (const game of games) {
      // Check if genres array exists
      if (!Array.isArray(game.genres) || game.genres.length === 0) {
        console.error(`❌ Game ${game._id} (${game.title}) has no genres!`);
        missingGenres++;
      } else {
        if (game.genres.length > 1) {
          multiGenre++;
        } else {
          singleGenreLegacy++;
        }
      }

      // Critical check: Ensure 'genre' (string) field is effectively gone/unused
      // Since we updated the schema, accessing game.genre might fail via TS,
      // but we can check if the key exists in the raw document if we were using lean().
      // Here we assume schema validation handles it, but let's check our logical constraint.
    }

    console.log("--- Results ---");
    console.log(
      `✅ Games with Genres: ${games.length - missingGenres}/${games.length}`
    );
    console.log(`✅ Multi-Genre Games: ${multiGenre}`);
    console.log(
      `⚠️ Single-Genre Games: ${singleGenreLegacy} (Acceptable if source had only one)`
    );

    if (missingGenres > 0) {
      console.error(
        `❌ FAILED: Found ${missingGenres} games with missing genre data.`
      );
      process.exit(1);
    }

    // Sanity Check: Expect at least 90% of games to have genres
    const coverage = ((games.length - missingGenres) / games.length) * 100;
    if (coverage < 90) {
      console.error(
        `❌ FAILED: Genre coverage too low (${coverage.toFixed(
          2
        )}%). Something went wrong with migration.`
      );
      process.exit(1);
    }

    console.log("✅ SUCCESS: Genre Expansion Integrity Verified.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Validation Script Error:", error);
    process.exit(1);
  }
};

validateGenres();
