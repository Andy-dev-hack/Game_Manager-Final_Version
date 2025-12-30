/**
 * @file list-genres.ts
 * @description Lists the count of games per genre in the catalog.
 */
import fs from "fs-extra";
import path from "path";

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");

const listGenres = async () => {
  try {
    const games = await fs.readJson(GAMES_FILE_PATH);
    const genreCounts: { [key: string]: number } = {};

    games.forEach((game: any) => {
      const genre = game.genre || "Unknown";
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    console.log(`\n📊 GAMES BY GENRE (${games.length} Total)\n`);
    console.log(`| Genre | Count |`);
    console.log(`|---|---|`);

    // Sort by count descending
    Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([genre, count]) => {
        console.log(`| ${genre} | ${count} |`);
      });
  } catch (error) {
    console.error("Error reading games:", error);
  }
};

listGenres();
