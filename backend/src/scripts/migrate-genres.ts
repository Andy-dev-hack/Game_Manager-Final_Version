/**
 * @file migrate-genres.ts
 * @description Migrates games from single 'genre' string to 'genres' string array.
 * Fetches full game details from RAWG to populate the array with up to 3 genres.
 */
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import logger from "../utils/logger";

dotenv.config();

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");
const RAWG_API_KEY = process.env.RAWG_API_KEY;
const DELAY_MS = 600; // Rate limit protection

if (!RAWG_API_KEY) {
  logger.error("❌ RAWG_API_KEY is missing in .env");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchGenresFromRawg = async (rawgId: number): Promise<string[]> => {
  try {
    const url = `https://api.rawg.io/api/games/${rawgId}?key=${RAWG_API_KEY}`;
    const response = await axios.get(url);

    if (response.data && response.data.genres) {
      // Get up to 3 genre names
      return response.data.genres.slice(0, 3).map((g: any) => g.name);
    }
    return [];
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      console.log(`   ⚠️ Rate Limited (RAWG). Waiting 5s...`);
      await sleep(5000);
      return fetchGenresFromRawg(rawgId); // Retry once
    }
    // console.error(`Error fetching RAWG ID ${rawgId}:`, error.message);
    return [];
  }
};

const migrateGenres = async () => {
  try {
    logger.info("🚀 Starting Genre Migration (Single -> Multi)...");

    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found.`);
      process.exit(1);
    }

    const games = await fs.readJson(GAMES_FILE_PATH);
    let updatedCount = 0;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      // Skip if already has populated genres array (and it's not empty)
      // Actually, we force update to ensure we have MULTIPLE genres as requested
      // But if we just ran it, maybe skip? Let's check if 'genres' exists.

      const hasMultiple =
        game.genres && Array.isArray(game.genres) && game.genres.length > 1;

      if (hasMultiple) {
        // console.log(`⏩ [${i+1}/${games.length}] ${game.title} already has genres: ${game.genres.join(", ")}`);
        continue;
      }

      process.stdout.write(
        `   🔄 [${i + 1}/${games.length}] Processing '${game.title}'... `
      );

      if (game.rawgId) {
        const newGenres = await fetchGenresFromRawg(game.rawgId);

        if (newGenres.length > 0) {
          game.genres = newGenres;

          // Remove old 'genre' field eventually, or keep it as primary?
          // For now, let's keep 'genre' as the PRIMARY (first) one for backward compat during migration
          // But the goal is to switch to genres array.
          game.genre = newGenres[0];

          console.log(`✅ ${newGenres.join(", ")}`);
          updatedCount++;
        } else {
          // Fallback if RAWG fails or returns nothing: use existing genre as single item array
          if (!game.genres || game.genres.length === 0) {
            game.genres = [game.genre || "Unknown"];
          }
          console.log(`⚠️ Kept existing: ${game.genre}`);
        }
      } else {
        // No RAWG ID
        if (!game.genres) {
          game.genres = [game.genre || "Unknown"];
        }
        console.log(`⏭️ No RAWG ID`);
      }

      // Autosave every 10 items
      if (updatedCount > 0 && updatedCount % 10 === 0) {
        await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });
      }

      await sleep(DELAY_MS);
    }

    // Final save
    await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });
    logger.info(`\n🎉 Migration Complete! Updated ${updatedCount} games.`);
  } catch (error) {
    logger.error("❌ Fatal Error:", error);
    process.exit(1);
  }
};

migrateGenres();
