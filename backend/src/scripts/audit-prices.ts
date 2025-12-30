/**
 * @file audit-prices.ts
 * @description Audits the curated games in games.json.
 * Identifies games without prices and categorizes them as "Future Release" or "Missing Price".
 */
import fs from "fs-extra";
import path from "path";
import logger from "../utils/logger";

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");

// The list we just imported
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

const auditPrices = async () => {
  try {
    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found.`);
      process.exit(1);
    }

    const allGames = await fs.readJson(GAMES_FILE_PATH);
    const gamesMap = new Map(allGames.map((g: any) => [g.title, g]));

    console.log(`\n🔍 AUDIT RESULTS FOR IMPORTED GAMES:\n`);
    console.log(`| Status | Game Title | Price | Release Date | Notes |`);
    console.log(`|---|---|---|---|---|`);

    let futureCount = 0;
    let exclusiveNoPriceCount = 0;
    let validPriceCount = 0;
    let missingPriceCount = 0;

    const now = new Date();

    for (const title of CURATED_LIST) {
      // Find game by title (fuzzy match or exact)
      // We search for partial match specifically for things like "God of War" vs "God of War (2018)"
      const game = allGames.find((g: any) =>
        g.title.toLowerCase().includes(title.toLowerCase().split(" (")[0])
      );

      if (!game) {
        // Try exact match in case fuzzy failed
        // console.log(`| ❓ | ${title} | - | - | Not found in DB |`);
        continue;
      }

      const hasPrice = game.price && game.price > 0;
      const releaseDate = game.released ? new Date(game.released) : null;
      const isFuture = releaseDate && releaseDate > now;

      let status = "";
      let notes = "";

      if (hasPrice) {
        status = "✅";
        notes = "OK";
        validPriceCount++;
      } else if (isFuture) {
        status = "📅";
        notes = "Future Release (No Price Expected)";
        futureCount++;
      } else {
        // Released but no price. Likely Exclusive or not on Steam.
        status = "⚠️";
        notes = "Released - No Steam Price (Exclusive?)";
        exclusiveNoPriceCount++;
      }

      console.log(
        `| ${status} | ${game.title} | ${
          hasPrice ? `$${game.price / 100}` : "N/A"
        } | ${game.released?.split("T")[0] || "N/A"} | ${notes} |`
      );
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Priced: ${validPriceCount}`);
    console.log(`📅 Future / Unreleased: ${futureCount}`);
    console.log(`⚠️ Released (No Price / Exclusive): ${exclusiveNoPriceCount}`);
  } catch (error) {
    console.error("Audit failed:", error);
  }
};

auditPrices();
