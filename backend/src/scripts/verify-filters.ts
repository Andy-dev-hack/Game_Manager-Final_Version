import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/game.model";
import connectDB from "../config/db";
import { getFilters } from "../services/game.service";
import logger from "../utils/logger";

dotenv.config();

const verify = async () => {
  logger.info("🕵️‍♂️ Verifying Catalog Filters...");
  await connectDB();

  try {
    const filters = await getFilters();
    console.log("\nAvailable Genres in DB:");
    console.log(filters.genres.join(", "));

    if (filters.genres.includes("Horror")) {
      console.log("\n✅ SUCCESS: 'Horror' is present in the genre list.");
    } else {
      console.log("\n❌ FAILURE: 'Horror' is MISSING from the genre list.");
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
};

verify();
