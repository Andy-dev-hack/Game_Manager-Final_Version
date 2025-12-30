import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import { searchGames } from "../services/game.service";
import logger from "../utils/logger";

dotenv.config();

const validate = async () => {
  logger.info("🧪 Starting VDD: Modern Store Backend Validation...");
  await connectDB();

  try {
    // 1. Validate onSale Filter
    logger.info("   🔍 Testing Filter: onSale=true");
    const saleResults = await searchGames(
      "",
      1,
      5,
      undefined,
      undefined,
      "releaseDate",
      "desc",
      true
    );

    if (saleResults.data.length === 0) {
      logger.warn(
        "      ⚠️  No games found on sale (This might be expected if none are on sale, but verifying logic runs)."
      );
    } else {
      const allSale = saleResults.data.every((g) => g.onSale === true);
      if (!allSale)
        throw new Error(
          "❌ Validation Failed: Game with onSale=false returned in onSale=true query."
        );
      logger.info(
        `      ✅ ${saleResults.data.length} games on sale found. First: ${saleResults.data[0].title} (Price: ${saleResults.data[0].price})`
      );
    }

    // 2. Validate maxPrice Filter
    logger.info("   🔍 Testing Filter: maxPrice=10");
    const cheapResults = await searchGames(
      "",
      1,
      5,
      undefined,
      undefined,
      "releaseDate",
      "desc",
      undefined,
      10
    );

    if (cheapResults.data.length === 0) {
      logger.warn("      ⚠️  No games under $10 found.");
    } else {
      const allCheap = cheapResults.data.every((g) => (g.price || 0) <= 10);
      if (!allCheap)
        throw new Error(
          "❌ Validation Failed: Game > $10 returned in maxPrice query."
        );
      logger.info(
        `      ✅ ${cheapResults.data.length} games under $10 found. Integity Check Passed.`
      );
    }

    logger.info("✨ Backend VDD Passed.");
    process.exit(0);
  } catch (error: any) {
    logger.error(`❌ VDD Failed: ${error.message}`);
    process.exit(1);
  }
};

validate();
