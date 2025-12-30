/**
 * @file apply-manual-prices.ts
 * @description Applies random prices between $30.99 and $59.99 to games missing price data.
 * Used to fill gaps for exclusives and unreleased games as requested by user.
 */
import fs from "fs-extra";
import path from "path";
import logger from "../utils/logger";

const GAMES_FILE_PATH = path.join(process.cwd(), "data", "games.json");

const getRandomPrice = () => {
  // Generate random integer between 30 and 59
  const base = Math.floor(Math.random() * (60 - 30)) + 30;
  // Add 0.99 for realistic pricing
  return base + 0.99;
};

const applyManualPrices = async () => {
  try {
    logger.info("🚀 Starting Manual Price Application...");

    if (!fs.existsSync(GAMES_FILE_PATH)) {
      logger.error(`❌ games.json not found.`);
      process.exit(1);
    }

    const games = await fs.readJson(GAMES_FILE_PATH);
    let updatedCount = 0;

    const updatedGames = games.map((game: any) => {
      // Check if price is missing (null, undefined, or 0)
      if (!game.price || game.price === 0) {
        const newPrice = getRandomPrice();

        // Log the change
        console.log(`   🏷️  ${game.title}: N/A -> $${newPrice}`);

        return {
          ...game,
          price: newPrice,
          // Ensure other price fields are consistent if they exist
          originalPrice: newPrice,
          currency: "USD",
          onSale: false,
          discount: 0,
        };
      }
      return game;
    });

    // Check if any changes were made
    updatedCount = updatedGames.filter(
      (g: any, i: number) => g.price !== games[i].price
    ).length;

    if (updatedCount > 0) {
      // Save changes
      await fs.writeJson(GAMES_FILE_PATH, updatedGames, { spaces: 2 });
      logger.info(`\n✅ Successfully applied prices to ${updatedCount} games.`);
    } else {
      logger.info("\n✨ No games needed price updates.");
    }
  } catch (error) {
    logger.error("❌ Error applying prices:", error);
    process.exit(1);
  }
};

applyManualPrices();
