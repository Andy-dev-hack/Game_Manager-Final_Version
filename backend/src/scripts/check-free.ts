import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import Game from "../models/game.model";

dotenv.config();

const check = async () => {
  await connectDB();
  const count = await Game.countDocuments({ price: 0 });
  console.log(`🎁 Free Games: ${count}`);

  if (count > 0) {
    const sample = await Game.findOne({ price: 0 }).select("title price");
    console.log(`   Sample: ${sample?.title} ($${sample?.price})`);
  } else {
    console.log(
      "   ⚠️ No free games found. We might need to fake some for the demo or update DB."
    );
  }
  process.exit(0);
};

check();
