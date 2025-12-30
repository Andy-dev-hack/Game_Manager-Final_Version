/**
 * @file repair-platforms.ts
 * @description Script to repair games.json by fetching real platform data from RAWG.
 * Iterates through all games and updates them if platform data is missing.
 */
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { getGameDetails } from "../services/rawg.service";
import logger from "../utils/logger";

// Load environment variables
dotenv.config();

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");
const DELAY_MS = 600; // Delay between requests to respect rate limits (RAWG free tier is lenient but good to be safe)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const repairPlatforms = async () => {
  try {
    logger.info("🔧 Starting Platform Data Repair...");

    // 1. Read games.json
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found at ${GAMES_FILE_PATH}`);
      process.exit(1);
    }

    const games = await fs.readJson(GAMES_FILE_PATH);
    logger.info(`📋 Found ${games.length} games to process.`);

    let updatedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // 2. Iterate and update
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      // Check if platforms needs update (missing or empty array)
      if (!game.platforms || game.platforms.length === 0) {
        try {
          // Log progress
          const progress = `[${i + 1}/${games.length}]`;
          console.log(
            `${progress} Fetching data for: ${game.title} (RAWG ID: ${game.rawgId})...`
          );

          // Fetch details from RAWG
          // Note: ensuring rawgId is a number
          const details = await getGameDetails(Number(game.rawgId));

          if (details && details.platforms && details.platforms.length > 0) {
            // Update the game object
            game.platforms = details.platforms;
            updatedCount++;
            // Show what we found to reassure user
            console.log(
              `   ✅ Found platforms: ${details.platforms.join(", ")}`
            );
          } else {
            console.warn(`   ⚠️ No platforms found for ${game.title}`);
            // keep existing data if any
          }

          // Save periodically (every 20 games) to avoid losing progress
          if (updatedCount > 0 && updatedCount % 20 === 0) {
            await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });
            console.log(`💾 Saved intermediate progress...`);
          }

          // Respect rate limits
          await sleep(DELAY_MS);
        } catch (error) {
          console.error(`   ❌ Failed to fetch ${game.title}:`, error);
          failedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    // 3. Final Save
    await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });

    logger.info("🎉 Repair Complete!");
    logger.info(`   ✅ Updated: ${updatedCount}`);
    logger.info(`   ⏭️ Skipped: ${skippedCount}`);
    logger.info(`   ❌ Failed: ${failedCount}`);
  } catch (error) {
    logger.error("❌ Fatal error during repair:", error);
    process.exit(1);
  }
};

// Execute
repairPlatforms();
