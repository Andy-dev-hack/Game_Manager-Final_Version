import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model.js";

// Load environment variables
dotenv.config();

const applySeasonalSale = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Seasonal Sale application...");

    const games = await Game.find({});
    console.log(
      `Found ${games.length} total games. Applying seasonal discounts to random selection...`
    );

    let updatedCount = 0;

    for (const game of games) {
      // 30% chance to be on sale
      if (Math.random() < 0.3) {
        // Random discount between 10% and 80%
        const discountPercent = Math.floor(Math.random() * (80 - 10 + 1) + 10);

        // Ensure we have a base price to work with
        // If originalPrice exists, assume it was the MSRP. If not, use current price.
        // But to be safe and idempotent, if we already ran this, price might be low.
        // We should set originalPrice = price ONLY if originalPrice is missing.

        if (!game.originalPrice) {
          game.originalPrice = game.price;
        }

        // Calculate new discounted price based on originalPrice
        const original = game.originalPrice || 20; // fallback logic
        const discountAmount = (original * discountPercent) / 100;
        const newPrice = Math.max(
          0,
          parseFloat((original - discountAmount).toFixed(2))
        );

        // Update fields
        game.price = newPrice; // Filter uses this!
        game.onSale = true;
        // game.discount = discountPercent; // Optional if schema supports it, but calculated on frontend usually

        updatedCount++;
        await game.save();
        console.log(
          `[SALE] ${game.title}: ${original}€ -> ${newPrice}€ (-${discountPercent}%)`
        );
      } else {
        // Ensure non-sale games are clean
        if (game.onSale) {
          // Restore price if it was on sale?
          // Ideally we'd need a way to know MSRP.
          // For now, let's assume if originalPrice exists, we restore it.
          if (game.originalPrice) {
            game.price = game.originalPrice;
          }
          game.onSale = false;
          await game.save();
        }
      }
    }

    console.log(
      `Seasonal Sale Applied! ${updatedCount} games are now on sale.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error applying seasonal sale:", error);
    process.exit(1);
  }
};

applySeasonalSale();
