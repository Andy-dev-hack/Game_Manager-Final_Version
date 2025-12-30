/**
 * @file payment.service.ts
 * @description Service for handling internal mock payments and checkout operations.
 */
import crypto from "crypto";
import { AppError } from "../utils/AppError";
import User from "../models/user.model";
import Game from "../models/game.model";
import Order from "../models/order.model";
import UserGame, { GameStatus } from "../models/userGame.model";
import { OrderStatus } from "../types/enums";
import * as mailService from "./mail.service";
import logger from "../utils/logger";

/**
 * Simulates a complete purchase process.
 * 1. Validates User and Games.
 * 2. Creates Order with License Keys.
 * 3. Updates User's Library (concurrently).
 * 4. Sends Confirmation Email (concurrently).
 *
 * @param userId - ID of the purchasing user
 * @param gameIds - Array of Game IDs to purchase
 * @returns {Promise<{ success: boolean; orderId: string; message: string }>}
 */
export const simulatePurchase = async (
  userId: string,
  gameIds: string[]
): Promise<{ success: boolean; orderId: string; message: string }> => {
  // 1. Validation & Data Fetching
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Fetch games (ensure proper unique check if needed, but 'in' handles it)
  const games = await Game.find({ _id: { $in: gameIds } });
  if (games.length !== gameIds.length) {
    throw new AppError("One or more games not found", 404);
  }

  if (games.length === 0) {
    throw new AppError("No games provided", 400);
  }

  // 2. Prepare Order Items (Sync)
  let totalAmount = 0;
  const orderItems = games.map((game) => {
    const price = game.price || 0; // Guard against missing price
    totalAmount += price;

    const licenseKey = `GAME-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}-${new Date().getFullYear()}`;

    return {
      game: game._id,
      title: game.title,
      price: price, // Snapshot price at time of purchase
      licenseKey: licenseKey,
      image: game.image,
    };
  });

  // 3. Create Order Record (DB)
  const order = await Order.create({
    user: userId,
    items: orderItems, // Mongoose handles the map to schema
    totalAmount,
    currency: "eur",
    status: OrderStatus.COMPLETED,
    stripePaymentIntentId: `mock_pi_${Date.now()}`,
  });

  logger.info(`Mock Order created: ${order._id}`);

  // 4. Concurrency: Update Library + Send Email
  // specific library updates need to be individual upserts usually
  const libraryUpdates = games.map((game) =>
    UserGame.findOneAndUpdate(
      { user: userId, game: game._id },
      {
        $set: { isOwned: true, status: GameStatus.PENDING },
        $setOnInsert: { hoursPlayed: 0, isFavorite: false },
      },
      { upsert: true, new: true }
    )
  );

  // Email promise (catch error inside so it doesn't fail the transaction)
  const emailPromise = mailService
    .sendPurchaseConfirmation(
      user.email,
      user.username,
      order._id.toString(),
      orderItems, // compatible structure
      totalAmount
    )
    .catch((err) => {
      logger.error(
        `Failed to send email for order ${order._id}: ${err.message}`
      );
      // validation: do not re-throw, purchase is successful
    });

  // Execute all side effects in parallel
  await Promise.all([...libraryUpdates, emailPromise]);

  logger.info(`Purchase completed for user ${userId}`);

  return {
    success: true,
    orderId: order._id.toString(),
    message: "Purchase simulated successfully",
  };
};
