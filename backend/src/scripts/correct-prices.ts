/**
 * @file correct-prices.ts
 * @description Correction script.
 * 1. Ensures manual prices are applied ONLY to the curated list.
 * 2. Re-fetches Steam prices for all OTHER games to fix incorrect manual pricing (e.g. restoring F2P status).
 */
import fs from "fs-extra";
import path from "path";
import logger from "../utils/logger";
import { getSteamGameDetails } from "../services/steam.service";

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");
const DELAY_MS = 600; // Delay for Steam API

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

const getRandomPrice = () => {
  const base = Math.floor(Math.random() * (60 - 30)) + 30;
  return base + 0.99;
};

const correctPrices = async () => {
  try {
    logger.info("🚀 Starting Price Correction...");

    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found.`);
      process.exit(1);
    }

    const games = await fs.readJson(GAMES_FILE_PATH);
    const curatedSet = new Set(
      CURATED_LIST.map((t) => t.toLowerCase().split(" (")[0])
    );

    let corrections = 0;

    for (const game of games) {
      const titleLower = game.title.toLowerCase().split(" (")[0];
      const isCurated =
        curatedSet.has(titleLower) ||
        CURATED_LIST.some((c) => c.toLowerCase().includes(titleLower));

      if (isCurated) {
        // --- CURATED LIST LOGIC ---
        // Ensure strictly has a price. If 0/null, apply RANDOM.
        // We do NOT fetch Steam for these again because we want the Manual Price if Steam was missing.
        if (!game.price || game.price === 0) {
          const newPrice = getRandomPrice();
          console.log(
            `   🎨 [Curated] ${game.title}: Applied Manual Price $${newPrice}`
          );
          game.price = newPrice;
          game.originalPrice = newPrice;
          corrections++;
        }
      } else {
        // --- NON-CURATED LOGIC (Legacy / Old Import) ---
        // These might have been incorrectly priced (e.g. Apex Legends).
        // Strategy: If it has Steam ID, re-fetch REAL price data.
        if (game.steamAppId) {
          try {
            process.stdout.write(`   🔄 [Legacy] Check ${game.title}... `);
            const steamData = await getSteamGameDetails(game.steamAppId);

            if (steamData && steamData.price_overview) {
              const realPrice = steamData.price_overview.final;
              if (game.price !== realPrice) {
                console.log(`FIXED -> $${realPrice / 100}`);
                game.price = realPrice;
                game.originalPrice = steamData.price_overview.initial;
                game.currency = steamData.price_overview.currency;
                game.onSale = steamData.price_overview.discount_percent > 0;
                game.discount = steamData.price_overview.discount_percent;
                corrections++;
              } else {
                console.log(`OK`);
              }
            } else if (steamData && steamData.is_free) {
              // It's Free to Play!
              if (game.price !== 0) {
                console.log(`FIXED -> FREE`);
                game.price = 0;
                game.originalPrice = 0;
                game.currency = "USD";
                corrections++;
              } else {
                console.log(`OK (Free)`);
              }
            } else {
              console.log(`(No Steam Price Data)`);
              // If we really can't find price, maybe revert to 0 if it looks like a manual price?
              // For safety, if it was > 0 and we can't verify, we leave it or zero it?
              // Let's assume most F2P will hit the is_free check.
            }
          } catch (err: any) {
            if (err.response && err.response.status === 429) {
              console.log(`⚠️ Rate Limited (429). Waiting 10s...`);
              await sleep(10000); // Wait 10s
            } else {
              console.log(`Error fetching Steam: ${err.message}`);
            }
          }
          await sleep(DELAY_MS);
        }
      }

      // Autosave every 10 corrections
      if (corrections > 0 && corrections % 10 === 0) {
        console.log(`   💾 Autosaving progress (${corrections} fixed)...`);
        await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });
      }
    }

    if (corrections > 0) {
      await fs.writeJson(GAMES_FILE_PATH, games, { spaces: 2 });
      logger.info(`\n✅ Corrections Saved. ${corrections} games updated.`);
    } else {
      logger.info(
        "\n✨ Catalog confirms to plan. No corrections made this run."
      );
    }
  } catch (error) {
    logger.error("❌ Fatal Error:", error);
    // Try to save before exit if possible
    process.exit(1);
  }
};

correctPrices();
