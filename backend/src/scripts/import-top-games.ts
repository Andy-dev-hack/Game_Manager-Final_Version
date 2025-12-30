/**
 * @file import-top-games.ts
 * @description Script to import top-rated games by date range.
 * STRICTLY validates Steam pricing before adding to the catalog.
 */
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { fetchTopGames } from "../services/rawg.service";
import { getCompleteGameData } from "../services/game-aggregator.service";
import logger from "../utils/logger";

// Load environment variables
dotenv.config();

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");
const DELAY_MS = 1500; // Slower delay to be respectful and avoid bans during heavy scraping

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Configuration for Phase 1 (Default)
const START_DATE = "2024-01-01";
const END_DATE = "2025-12-31";
const TARGET_ADDITIONS = 80;
const PAGE_SIZE = 40;
const MAX_PAGES = 5; // Search up to 200 candidates to find 80 valid ones

const importTopGames = async () => {
  try {
    logger.info(`🚀 Starting Top Games Import (${START_DATE} - ${END_DATE})`);
    logger.info(
      `🎯 Target: Add ${TARGET_ADDITIONS} NEW games with confirmed prices.`
    );

    // 1. Read existing games
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found at ${GAMES_FILE_PATH}`);
      process.exit(1);
    }

    const existingGames = await fs.readJson(GAMES_FILE_PATH);
    const existingRawgIds = new Set(existingGames.map((g: any) => g.rawgId));

    logger.info(`📋 Existing Catalog: ${existingGames.length} games.`);

    let addedCount = 0;
    let checkedCount = 0;
    let page = 1;

    while (addedCount < TARGET_ADDITIONS && page <= MAX_PAGES) {
      logger.info(`📄 Fetching Page ${page} of candidates...`);

      const candidates = await fetchTopGames(
        START_DATE,
        END_DATE,
        page,
        PAGE_SIZE
      );

      if (!candidates || candidates.length === 0) {
        logger.info("⚠️ No more candidates found.");
        break;
      }

      for (const candidate of candidates) {
        if (addedCount >= TARGET_ADDITIONS) break;
        checkedCount++;

        // Deduplication
        if (existingRawgIds.has(candidate.rawgId)) {
          // logger.info(`   ⏭️ Skipped ${candidate.title} (Already exists)`);
          continue;
        }

        try {
          process.stdout.write(`   🔍 Checking ${candidate.title}... `);

          // Get Full Details + Pricing
          // This calls game-aggregator -> steam.service
          const details = await getCompleteGameData(candidate.rawgId);

          // STRICT PRICE CHECK
          if (details.price && details.price > 0) {
            // Valid! Add to list
            existingGames.push(details);
            existingRawgIds.add(candidate.rawgId); // Prevent dupes within same run
            addedCount++;

            console.log(`✅ MATCH! Price: $${details.price / 100}`);

            // Autosave every 5 additions
            if (addedCount % 5 === 0) {
              await fs.writeJson(GAMES_FILE_PATH, existingGames, { spaces: 2 });
              console.log(
                `      💾 Autosaved progress (${addedCount}/${TARGET_ADDITIONS})`
              );
            }
          } else {
            console.log(`❌ Skipped (No Price/Free)`);
          }

          // Respect rate limits
          await sleep(DELAY_MS);
        } catch (error) {
          console.log(`❌ Error: ${(error as any).message}`);
        }
      }

      page++;
    }

    // Final Save
    await fs.writeJson(GAMES_FILE_PATH, existingGames, { spaces: 2 });

    logger.info("\n🎉 Import Complete!");
    logger.info(`   📊 Candidates Checked: ${checkedCount}`);
    logger.info(`   ✅ Newly Added: ${addedCount}`);
    logger.info(`   📚 Total Collection Size: ${existingGames.length}`);
  } catch (error) {
    logger.error("❌ Fatal error during import:", error);
    process.exit(1);
  }
};

// Execute
importTopGames();
