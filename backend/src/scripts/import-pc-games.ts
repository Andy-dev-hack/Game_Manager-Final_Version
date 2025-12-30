/**
 * @file import-pc-games.ts
 * @description Bulk import script for 100 popular PC games.
 * Fetches from RAWG (Metadata) and Steam (Price).
 * Features:
 * - Smart Fill: Only imports NEW games until target (100) is reached.
 * - Dry Run: Default mode, generates 'import-preview.json'.
 * - Commit: Use --commit to save to DB and games.json.
 * - Safety: Upsert only, no deletions.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import Game, { IGame } from "../models/game.model";
import connectDB from "../config/db";
import logger from "../utils/logger";
import {
  fetchPopularPCGames,
  getGameDetails,
  getScreenshots,
} from "../services/rawg.service";
import {
  extractSteamAppId,
  getSteamGameDetails,
  searchSteamGames,
} from "../services/steam.service";

dotenv.config();

const TARGET_NEW_GAMES = 200;
const MAX_PAGES = 25; // Increased to ensure finding 200 new games
const PAGE_SIZE = 40;
const PREVIEW_FILE = "import-preview.json";
const GAMES_JSON_PATH = path.join(process.cwd(), "data", "games.json");

// Helper to delay execution (avoid API rate limits)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runImport = async () => {
  const isCommit = process.argv.includes("--commit");
  const mode = isCommit
    ? "🔴 COMMIT MODE (Writes to DB)"
    : "🟢 DRY RUN (Simulation)";

  logger.info("=".repeat(60));
  logger.info(`🚀 Starting Bulk Import: Top PC Games`);
  logger.info(`🎯 Target: ${TARGET_NEW_GAMES} NEW games`);
  logger.info(`🛠️  Mode: ${mode}`);
  logger.info("=".repeat(60));

  try {
    await connectDB();

    let importedCount = 0;
    let page = 1;
    let processedRawgIds = new Set<number>();

    const newGamesCollection: any[] = [];

    // Load existing RAWG IDs from DB to filter duplicates efficiently
    const existingDocs = await Game.find({}, { rawgId: 1, title: 1 });
    const existingRawgIds = new Set(existingDocs.map((g) => g.rawgId));
    const existingTitles = new Set(
      existingDocs.map((g) => g.title.toLowerCase())
    );

    logger.info(`📚 Database contains ${existingDocs.length} games.`);

    // Genre Quotas to achieve balance (Total ~200)
    // Target Genres for Horror Expansion
    const GENRE_TARGETS = [
      { slug: "horror", name: "Horror", target: 30 },
      // { slug: "sports", name: "Sports", target: 40 },
      // { slug: "racing", name: "Racing", target: 40 },
      // { slug: "simulation", name: "Simulation", target: 40 },
      // { slug: "strategy", name: "Strategy", target: 30 },
      // { slug: "puzzle", name: "Puzzle", target: 20 },
      // { slug: "fighting", name: "Fighting", target: 20 },
      // { slug: "platformer", name: "Platformer", target: 10 },
    ];

    let totalImported = 0;

    for (const genreDef of GENRE_TARGETS) {
      let genreImported = 0;
      let page = 1;
      let fails = 0;

      logger.info(
        `\n🎯 TARGETING GENRE: ${genreDef.name} (Goal: ${genreDef.target} new games)`
      );

      while (
        genreImported < genreDef.target &&
        page <= MAX_PAGES &&
        fails < 3
      ) {
        try {
          logger.info(`   📄 Fetching Page ${page} for ${genreDef.name}...`);

          const candidates = await fetchPopularPCGames(
            page,
            PAGE_SIZE,
            genreDef.slug
          );

          if (!candidates || candidates.length === 0) {
            logger.warn(`   ⚠️ No more candidates for ${genreDef.name}`);
            break;
          }

          for (const candidate of candidates) {
            if (genreImported >= genreDef.target) break;

            // Global Deduplication
            if (
              existingRawgIds.has(candidate.rawgId) ||
              existingTitles.has(candidate.title.toLowerCase()) ||
              processedRawgIds.has(candidate.rawgId)
            ) {
              process.stdout.write(".");
              continue;
            }

            processedRawgIds.add(candidate.rawgId);

            logger.info(
              `   🔍 Processing NEW ${genreDef.name}: ${candidate.title} (ID: ${candidate.rawgId})`
            );

            try {
              // 1. Fetch Details
              await delay(800); // 1.2s delay for safety
              const details = await getGameDetails(candidate.rawgId);

              if (!details) {
                process.stdout.write("x");
                continue;
              }

              // 2. Fetch Screenshots
              const screenshots = await getScreenshots(candidate.rawgId);

              // 3. Fetch Steam Price (STRICT MODE)
              let steamAppId: number | null = null;
              let priceData = {
                price: 0,
                currency: "USD",
                discount: 0,
                onSale: false,
                originalPrice: 0,
              };

              // A. Try direct link from RAWG
              const steamStore = details.stores.find((s) =>
                s.url.includes("store.steampowered.com")
              );
              if (steamStore) steamAppId = extractSteamAppId(steamStore.url);

              if (
                !steamAppId &&
                details.website &&
                details.website.includes("store.steampowered.com")
              ) {
                steamAppId = extractSteamAppId(details.website);
              }

              // B. Fallback: Search Steam by Title (Smart Fix)
              if (!steamAppId) {
                try {
                  steamAppId = await searchSteamGames(details.name);
                  if (steamAppId)
                    logger.info(
                      `      🔄 Found via Steam Search: ${steamAppId}`
                    );
                } catch (e) {
                  // ignore
                }
              }

              // C. Strict Check: If no Steam ID, SKIP
              if (!steamAppId) {
                logger.warn(
                  `      ❌ Skipping ${details.name} (No Steam ID found)`
                );
                continue;
              }

              // D. Fetch Price & Validate
              const steamDetails = await getSteamGameDetails(steamAppId);

              if (steamDetails && steamDetails.price_overview) {
                priceData = {
                  price: steamDetails.price_overview.final / 100,
                  currency: steamDetails.price_overview.currency,
                  discount: steamDetails.price_overview.discount_percent,
                  onSale: steamDetails.price_overview.discount_percent > 0,
                  originalPrice: steamDetails.price_overview.initial / 100,
                };
              } else if (steamDetails && steamDetails.is_free) {
                // Free to play is acceptable as "Priced 0"
                priceData.price = 0;
              } else {
                // Verify if it's REALLY just missing price (Delisted)
                // User requested "games with price".
                // If we can't get price data, and it's not marked free, assume delisted.
                logger.warn(
                  `      ❌ Skipping ${details.name} (Steam ID found but no price/delisted)`
                );
                continue;
              }

              // 4. Map Payload
              const objectId = new mongoose.Types.ObjectId();

              const basePayload = {
                title: details.name,
                description: details.description || "",
                developer: details.developers[0] || "Unknown",
                publisher: details.publishers[0] || "Unknown",
                genre: details.genres[0] || "Action",
                platform: "PC",
                released: new Date(details.released),
                image: details.cover,
                screenshots: screenshots.slice(0, 6),
                score: details.rating ? Math.round(details.rating * 2) : 0,
                metacritic: details.metacritic,
                rawgId: details.rawgId,
                steamAppId: steamAppId,
                price: priceData.price,
                originalPrice: priceData.originalPrice,
                discount: priceData.discount,
                currency: priceData.currency,
                onSale: priceData.onSale,
              };

              const dbPayload = {
                ...basePayload,
                id: objectId,
                _id: objectId,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              const jsonPayload = {
                _id: objectId.toString(),
                ...basePayload,
              };

              // 5. Action
              if (isCommit) {
                await Game.updateOne(
                  { rawgId: dbPayload.rawgId },
                  { $set: dbPayload },
                  { upsert: true }
                );
                logger.info(`     ✅ Saved: ${dbPayload.title}`);
                newGamesCollection.push(jsonPayload);
              } else {
                logger.info(
                  `     📝 [Dry Run]: ${jsonPayload.title} ($${jsonPayload.price})`
                );
                newGamesCollection.push(jsonPayload);
              }

              genreImported++;
              totalImported++;
            } catch (err: any) {
              // Explicitly type err as any
              logger.error(`     ❌ Skip ${candidate.title}: ${err.message}`); // Access err.message
            }
          }
          page++;
        } catch (err: any) {
          // Explicitly type err as any
          logger.error(`   ❌ Error fetching page ${page}: ${err.message}`); // Access err.message
          fails++;
        }
      }
      logger.info(
        `✅ Finished ${genreDef.name}: Added ${genreImported} games.\n`
      );
    }

    // FINISHING UP

    if (isCommit) {
      // 5. Save to games.json (Append Only)
      if (newGamesCollection.length > 0) {
        logger.info(
          `\n💾 Persisting ${newGamesCollection.length} games to games.json...`
        );

        try {
          const currentFileContent = await fs.readJson(GAMES_JSON_PATH);

          if (
            !Array.isArray(currentFileContent) ||
            currentFileContent.length === 0
          ) {
            throw new Error(
              "games.json seems empty or invalid. Aborting write to verify integrity."
            );
          }

          // Append new games
          currentFileContent.push(...newGamesCollection);

          // Write back atomically
          await fs.writeJson(GAMES_JSON_PATH, currentFileContent, {
            spaces: 4,
          });
          logger.info("✅ games.json updated successfully.");
        } catch (fileErr) {
          logger.error(`❌ Error updating games.json: ${fileErr}`);
          logger.warn(
            "⚠️ Data was saved to MongoDB but NOT to games.json. Please check manually."
          );
        }
      }
    } else {
      // Save Preview
      await fs.writeJson(PREVIEW_FILE, newGamesCollection, { spaces: 2 });
      logger.info(`\n📄 Preview saved to ${PREVIEW_FILE}`);
    }

    logger.info("\n" + "=".repeat(60));
    logger.info(`🏁 Import Finished`);
    logger.info(`✨ Successfully processed: ${importedCount} games`);
    if (!isCommit) {
      logger.info(
        `ℹ️  This was a DRY RUN. No changes were made to DB or games.json.`
      );
      logger.info(`👉 Run with --commit to execute.`);
    }
    logger.info("=".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Fatal Error: ${error}`);
    process.exit(1);
  }
};

runImport();
