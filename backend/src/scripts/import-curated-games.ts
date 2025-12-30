/**
 * @file import-curated-games.ts
 * @description Script to import a specific curated list of games.
 * Attempts to fetch Steam prices but imports games even if price is missing (exclusives).
 */
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { searchGames } from "../services/rawg.service";
import { getCompleteGameData } from "../services/game-aggregator.service";
import logger from "../utils/logger";

// Load environment variables
dotenv.config();

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");
const DELAY_MS = 1200; // Respectful delay

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CURATED_LIST = [
  "The Legend of Zelda: Breath of the Wild",
  "Red Dead Redemption 2",
  "Elden Ring",
  "Baldur's Gate 3",
  "The Legend of Zelda: Tears of the Kingdom",
  "Hades II",
  "God of War (2018)",
  "Persona 5 Royal",
  "The Witcher 3: Wild Hunt",
  "Disco Elysium: The Final Cut",
  "Astro Bot",
  "Final Fantasy VII Rebirth",
  "Super Mario Odyssey",
  "The Last of Us Part II",
  "Bloodborne",
  "God of War Ragnarök",
  "Resident Evil 4",
  "Sekiro: Shadows Die Twice",
  "Hades",
  "Hollow Knight",
  "Metal Gear Solid V: The Phantom Pain",
  "Uncharted 4: A Thief's End",
  "Forza Horizon 5",
  "Metroid Dread",
  "It Takes Two",
  "Alan Wake 2",
  "Street Fighter 6",
  "Celeste",
  "Undertale",
  "Inside",
  "Persona 5",
  "Demon's Souls",
  "Ratchet & Clank: Rift Apart",
  "Marvel's Spider-Man 2",
  "Ghost of Tsushima",
  "Cyberpunk 2077",
  "Outer Wilds",
  "Doom Eternal",
  "Cuphead",
  "Stardew Valley",
  "Ori and the Will of the Wisps",
  "Xenoblade Chronicles 3",
  "Dragon Quest XI S",
  "Monster Hunter: World",
  "Resident Evil 2",
  "Divinity: Original Sin II",
  "Half-Life: Alyx",
  "Animal Crossing: New Horizons",
  "Horizon Zero Dawn",
  "Control",
  "Clair Obscur: Expedition 33",
  "Blue Prince",
  "Split Fiction",
  "Death Stranding 2: On the Beach",
  "Donkey Kong Bananza",
  "Metroid Prime 4: Beyond",
  "Slay the Spire",
  "Balatro",
  "Dave the Diver",
  "Sea of Stars",
  "Chained Echoes",
  "Tunic",
  "Inscryption",
  "Neon White",
  "Vampire Survivors",
  "Hi-Fi RUSH",
  "Armored Core VI: Fires of Rubicon",
  "Returnal",
  "Psychonauts 2",
  "NieR: Automata",
  "Yakuza: Like a Dragon",
  "Like a Dragon: Infinite Wealth",
  "Final Fantasy XVI",
  "Monster Hunter Wilds",
  "Kingdom Come: Deliverance II",
  "Hollow Knight: Silksong",
  "Dead Space",
  "Star Wars Jedi: Survivor",
  "Microsoft Flight Simulator",
  "Titanfall 2",
  "Overwatch",
  "XCOM 2",
  "Civilization VI",
  "Fire Emblem: Three Houses",
  "Astral Chain",
  "Bayonetta 3",
  "Super Smash Bros. Ultimate",
  "Mario Kart 8 Deluxe",
  "Tekken 8",
  "Mortal Kombat 1",
  "Guilty Gear -Strive-",
  "Dragon Ball FighterZ",
  "Gran Turismo 7",
  "Forza Motorsport",
  "F1 24",
  "Dirt Rally 2.0",
  "Katana ZERO",
  "Hotline Miami 2: Wrong Number",
  "Shovel Knight: Treasure Trove",
  "Dead Cells",
];

const importCuratedGames = async () => {
  try {
    logger.info(`🚀 Starting Curated Games Import`);
    logger.info(`🎯 List Size: ${CURATED_LIST.length} games`);

    // 1. Read existing games
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found at ${GAMES_FILE_PATH}`);
      process.exit(1);
    }

    const existingGames = await fs.readJson(GAMES_FILE_PATH);
    const existingRawgIds = new Set(existingGames.map((g: any) => g.rawgId));

    logger.info(`📋 Existing Catalog: ${existingGames.length} games.`);

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const title of CURATED_LIST) {
      try {
        process.stdout.write(`   🔍 Processing "${title}"... `);

        // 1. Search RAWG to get ID
        const searchResults = await searchGames(title, 1);

        if (!searchResults || searchResults.length === 0) {
          console.log(`❌ Not found in RAWG`);
          errorCount++;
          continue;
        }

        // Take the first result (usually the correct one for exact matches)
        const bestMatch = searchResults[0];

        // Deduplication
        if (existingRawgIds.has(bestMatch.rawgId)) {
          console.log(`⏭️ Skipped (Already exists)`);
          skippedCount++;
          continue;
        }

        // 2. Fetch Full Details + Optional Price
        const details = await getCompleteGameData(bestMatch.rawgId);

        // Add to list regardless of price
        existingGames.push(details);
        existingRawgIds.add(bestMatch.rawgId);
        addedCount++;

        const priceDisplay = details.price
          ? `$${details.price / 100}`
          : "N/A (Imported)";
        console.log(`✅ MATCH! Price: ${priceDisplay}`);

        // Autosave every 5 additions
        if (addedCount % 5 === 0) {
          await fs.writeJson(GAMES_FILE_PATH, existingGames, { spaces: 2 });
          console.log(`      💾 Autosaved progress (${addedCount} added)`);
        }

        await sleep(DELAY_MS);
      } catch (error) {
        console.log(`❌ Error: ${(error as any).message}`);
        errorCount++;
      }
    }

    // Final Save
    await fs.writeJson(GAMES_FILE_PATH, existingGames, { spaces: 2 });

    logger.info("\n🎉 Curated Import Complete!");
    logger.info(`   ✅ Newly Added: ${addedCount}`);
    logger.info(`   ⏭️ Skipped: ${skippedCount}`);
    logger.info(`   ❌ Failed/Not Found: ${errorCount}`);
    logger.info(`   📚 Total Collection Size: ${existingGames.length}`);
  } catch (error) {
    logger.error("❌ Fatal error during import:", error);
    process.exit(1);
  }
};

// Execute
importCuratedGames();
