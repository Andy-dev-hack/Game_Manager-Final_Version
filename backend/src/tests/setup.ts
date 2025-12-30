/**
 * @file setup.ts
 * @description Global setup for Jest tests, handling Mongoose connections.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }
    await mongoose.connect(uri, {
      dbName: "game-manager-test",
    });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
