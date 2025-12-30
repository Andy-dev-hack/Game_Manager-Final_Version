import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import Game from "../models/game.model";

dotenv.config();

const check = async () => {
  await connectDB();
  const games = await Game.find({ onSale: true })
    .select("title discount onSale")
    .limit(10);
  console.log(`🔥 Found ${games.length} sample games on sale:`);
  games.forEach((g) =>
    console.log(`   - ${g.title}: Discount=${g.discount}, OnSale=${g.onSale}`)
  );
  process.exit(0);
};

check();
