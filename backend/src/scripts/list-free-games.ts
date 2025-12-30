/**
 * @file list-free-games.ts
 * @description Lists all games with price 0 (Free) in the catalog.
 */
import fs from "fs-extra";
import path from "path";

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");

const listFreeGames = async () => {
  try {
    const games = await fs.readJson(GAMES_FILE_PATH);
    // Filter for price 0 (or null/undefined if we missed any, though we shouldn't have)
    const freeGames = games.filter(
      (g: any) => g.price === 0 || g.price === null || g.price === undefined
    );

    console.log(`\n🆓 TOTAL FREE GAMES: ${freeGames.length}\n`);
    console.log("--- Titles ---");
    // Sort alphabetically
    freeGames.sort((a: any, b: any) => a.title.localeCompare(b.title));

    freeGames.forEach((g: any) => console.log(`- ${g.title}`));
  } catch (error) {
    console.error("Error reading games:", error);
  }
};

listFreeGames();
