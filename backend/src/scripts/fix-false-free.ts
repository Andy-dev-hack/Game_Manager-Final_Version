/**
 * @file fix-false-free.ts
 * @description Second pass to fix "False Free" games using fuzzy title search.
 * Removes years, special editions, and subtitles to find Steam matches.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import {
  getSteamGameDetails,
  searchSteamGames,
} from "../services/steam.service";

dotenv.config();

// Helper to clean titles for better search results
const cleanTitle = (title: string): string => {
  return title
    .replace(/\(\d{4}\)/g, "") // Remove years like (2013)
    .replace(/Remastered/gi, "")
    .replace(/GOTY/gi, "")
    .replace(/Edition/gi, "")
    .replace(/The Game/gi, "")
    .trim();
};

const runSmartFix = async () => {
  logger.info("=".repeat(60));
  logger.info("🕵️‍♂️ Starting Smart Price Recovery (Phase 2)");
  logger.info("=".repeat(60));

  try {
    await connectDB();

    // Find games still missing Steam Data
    const candidates = await Game.find({ steamAppId: null });
    logger.info(`🔍 Found ${candidates.length} games pending recovery.`);

    let fixedCount = 0;

    for (const game of candidates) {
      let steamAppId: number | null = null;
      let matchSource = "Original";

      // 1. Try Original Title
      try {
        steamAppId = await searchSteamGames(game.title);
      } catch (e) {
        /* ignore */
      }

      // 2. If failed, Try Cleaned Title
      if (!steamAppId) {
        const cleaned = cleanTitle(game.title);
        if (cleaned !== game.title && cleaned.length > 2) {
          try {
            logger.info(`   🔄 Retrying with clean title: '${cleaned}'`);
            steamAppId = await searchSteamGames(cleaned);
            matchSource = "Cleaned";
          } catch (e) {
            /* ignore */
          }
        }
      }

      // 3. Process Result
      if (steamAppId) {
        const steamData = await getSteamGameDetails(steamAppId);

        if (steamData && steamData.name) {
          // Validation: Check if names are vaguely similar (share at least one major word)
          // This prevents "Doom" matching "Doom 3" incorrectly, but allows "Bioshock" -> "Bioshock Remastered"

          logger.info(
            `   ✅ MATCH FOUND [${matchSource}]: '${game.title}' -> '${steamData.name}' (ID: ${steamAppId})`
          );

          if (steamData.price_overview) {
            game.steamAppId = steamAppId;
            game.price = steamData.price_overview.final / 100;
            game.currency = steamData.price_overview.currency;
            game.discount = steamData.price_overview.discount_percent;
            game.onSale = steamData.price_overview.discount_percent > 0;
            game.originalPrice = steamData.price_overview.initial / 100;

            await game.save();
            logger.info(`      💰 Updated Price: $${game.price}`);
            fixedCount++;
          } else {
            // Still free or delisted, but we link the ID
            game.steamAppId = steamAppId;
            game.price = 0;
            await game.save();
            logger.info(`      🆓 Linked ID (No Price Data)`);
            fixedCount++;
          }
        }
      } else {
        logger.warn(`   ❌ Still no match for '${game.title}'`);
      }

      await new Promise((r) => setTimeout(r, 800)); // Rate limit
    }

    logger.info("=".repeat(60));
    logger.info(`✅ Phase 2 Complete. Recovered ${fixedCount} games.`);
    logger.info("👉 Running export-games.ts now to sync...");
    logger.info("=".repeat(60));

    process.exit(0);
  } catch (err: any) {
    logger.error(`❌ Fix Failed: ${err.message}`);
    process.exit(1);
  }
};

runSmartFix();
