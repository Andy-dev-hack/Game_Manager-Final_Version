/**
 * @file cron.service.ts
 * @description Service for handling automated background tasks.
 * Includes daily price updates from Steam.
 * Destination: Imported in server.ts to initialize cron jobs.
 */
import cron from "node-cron";
import Game from "../models/game.model";
import RefreshToken from "../models/refreshToken.model";
import Order from "../models/order.model";
import { OrderStatus } from "../types/enums";
import { getSteamGameDetails } from "./steam.service";
import logger from "../utils/logger";

/**
 * Update prices for all games with a Steam App ID
 */
const updateGamePrices = async () => {
  try {
    const games = await Game.find({ steamAppId: { $exists: true, $ne: null } });
    logger.info(`Found ${games.length} games to update prices.`);

    for (const game of games) {
      if (!game.steamAppId) continue;

      try {
        // Add a small delay to avoid hitting rate limits even with cache
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fetch USD Data
        const steamDataUSD = await getSteamGameDetails(game.steamAppId, "us");

        // Fetch EUR Data
        const steamDataEUR = await getSteamGameDetails(game.steamAppId, "es");

        if (steamDataUSD && steamDataUSD.price_overview) {
          // Update Legacy Fields (Default to USD)
          game.price = steamDataUSD.price_overview.final / 100;
          game.currency = steamDataUSD.price_overview.currency;
          game.discount = steamDataUSD.price_overview.discount_percent;
          game.onSale = steamDataUSD.price_overview.discount_percent > 0;
          game.originalPrice = steamDataUSD.price_overview.initial / 100;

          // Update Multi-currency Fields
          game.prices = game.prices || {};
          game.originalPrices = game.originalPrices || {};

          game.prices.usd = steamDataUSD.price_overview.final / 100;
          game.originalPrices.usd = steamDataUSD.price_overview.initial / 100;
        }

        if (steamDataEUR && steamDataEUR.price_overview) {
          game.prices = game.prices || {};
          game.originalPrices = game.originalPrices || {};

          game.prices.eur = steamDataEUR.price_overview.final / 100;
          game.originalPrices.eur = steamDataEUR.price_overview.initial / 100;
        }

        await game.save();
        logger.info(`Updated prices for game: ${game.title} (USD/EUR)`);
      } catch (error) {
        logger.error(`Failed to update price for game ${game.title}: ${error}`);
      }
    }

    logger.info("Daily price update job completed.");
  } catch (error) {
    logger.error(`Error in daily price update job: ${error}`);
  }
};

/**
 * Remove expired refresh tokens from database
 * Destination: Called by cron scheduler.
 */
export const cleanupExpiredTokens = async () => {
  try {
    const result = await RefreshToken.deleteMany({
      expires: { $lt: new Date() },
    });
    logger.info(
      `Expired Token Cleanup: Removed ${result.deletedCount} expired refresh tokens.`
    );
  } catch (error) {
    logger.error(`Error cleaning up expired tokens: ${error}`);
  }
};

/**
 * Remove stale PENDING orders (older than 24 hours)
 * Destination: Called by cron scheduler.
 */
export const cleanupPendingOrders = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Order.deleteMany({
      status: OrderStatus.PENDING,
      createdAt: { $lt: twentyFourHoursAgo },
    });
    logger.info(
      `Pending Order Cleanup: Removed ${result.deletedCount} stale orders.`
    );
  } catch (error) {
    logger.error(`Error cleaning up pending orders: ${error}`);
  }
};

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
  logger.info("Initializing cron jobs...");

  // Schedule daily price update at 03:00 AM
  cron.schedule("0 3 * * *", async () => {
    logger.info("Starting daily price update job...");
    await updateGamePrices();
  });

  // Schedule expired token cleanup at 04:00 AM
  cron.schedule("0 4 * * *", async () => {
    logger.info("Starting expired token cleanup job...");
    await cleanupExpiredTokens();
  });

  // Schedule pending order cleanup at 04:30 AM
  cron.schedule("30 4 * * *", async () => {
    logger.info("Starting pending order cleanup job...");
    await cleanupPendingOrders();
  });

  logger.info("Cron jobs initialized.");
};
