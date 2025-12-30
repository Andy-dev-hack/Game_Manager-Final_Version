import fs from "fs";
import path from "path";
import { getGameDetails } from "../services/rawg.service";

const GAMES_FILE_PATH = path.join(__dirname, "../../data/games.json");

interface GameEntry {
  title: string;
  platform?: string;
  platforms?: string[];
  rawgId?: number;
  [key: string]: any;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const enrichGames = async () => {
  try {
    console.log("Reading games.json...");
    const rawData = fs.readFileSync(GAMES_FILE_PATH, "utf8");
    const rawGames: GameEntry[] = JSON.parse(rawData);

    // Deduplicate by title
    const uniqueGamesMap = new Map<string, GameEntry>();
    for (const game of rawGames) {
      if (!uniqueGamesMap.has(game.title)) {
        uniqueGamesMap.set(game.title, game);
      }
    }
    const games = Array.from(uniqueGamesMap.values());

    console.log(
      `Loaded ${rawGames.length} games. After removing duplicates: ${games.length} games.`
    );
    console.log(`Processing ${games.length} games. This may take a while...`);

    const enrichedGames: GameEntry[] = [];
    let processedCount = 0;

    for (const [index, game] of games.entries()) {
      // 1. Schema Migration: ensure platforms array exists
      if (!game.platforms) {
        game.platforms = game.platform ? [game.platform] : [];
      }
      delete game.platform;

      // 2. Fetch data from RAWG for ALL games
      if (game.rawgId) {
        try {
          // Rate limiting delay removed per user request
          // await sleep(300);

          const details = await getGameDetails(game.rawgId);
          if (details.platforms && details.platforms.length > 0) {
            game.platforms = details.platforms;
            // console.log(`[${index + 1}/${games.length}] Updated ${game.title}: [${game.platforms.join(", ")}]`);
          } else {
            // console.log(`[${index + 1}/${games.length}] No platforms found for ${game.title}`);
          }
        } catch (e) {
          console.error(
            `[${index + 1}/${games.length}] Failed to enrich ${game.title}:`,
            e
          );
        }
      }

      enrichedGames.push(game);
      processedCount++;

      // Log progress every 50 games
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${games.length} games...`);
      }
    }

    // Write final result
    fs.writeFileSync(GAMES_FILE_PATH, JSON.stringify(enrichedGames, null, 4));
    console.log("Successfully enriched and migrated all games in games.json");
  } catch (error) {
    console.error("Critical error processing games.json:", error);
    process.exit(1);
  }
};

enrichGames();
