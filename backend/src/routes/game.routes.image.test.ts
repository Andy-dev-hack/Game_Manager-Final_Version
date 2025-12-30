/**
 * @file game.image.test.ts
 * @description Integration tests for game image handling.
 * Tests backward compatibility and URL-based images.
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import Game from "../models/game.model";
import User from "../models/user.model";
import { UserRole } from "../types/enums";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
};

describe("Game Image Logic Verification", () => {
  let adminToken: string;
  let gameId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // DO NOT delete entire DB. Only create test data.

    // Create test admin
    const admin = await User.create({
      username: "admin_img_test_" + Date.now(),
      email: "admin_img_test@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = generateToken(admin._id as unknown as string, admin.role);
  });

  afterAll(async () => {
    // Clean up ONLY data created in this test
    await User.deleteOne({ email: "admin_img_test@test.com" });
    if (gameId) {
      await Game.findByIdAndDelete(gameId);
    }
    await Game.deleteMany({ title: "Url Game" }); // Clean up the other created game
    await mongoose.connection.close();
  });

  it("should create a game WITHOUT image (Backward Compatibility)", async () => {
    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Legacy Game",
        genre: "Test",
        platform: "PC",
      });

    expect(res.status).toBe(201);
    expect(res.body.game).toHaveProperty("title", "Legacy Game");
    // Image should be undefined or null, but NOT error
    expect(res.body.game.image).toBeUndefined();

    gameId = res.body.game._id;
  });

  it("should create a game WITH image URL (New Feature)", async () => {
    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Url Game",
        genre: "Test",
        platform: "PC",
        image: "https://example.com/cover.jpg",
      });

    expect(res.status).toBe(201);
    expect(res.body.game).toHaveProperty("title", "Url Game");
    expect(res.body.game).toHaveProperty(
      "image",
      "https://example.com/cover.jpg"
    );
  });

  it("should update an existing game to add an image URL", async () => {
    const res = await request(app)
      .put(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        image: "https://example.com/legacy-cover.jpg",
      });

    expect(res.status).toBe(200);
    expect(res.body.game).toHaveProperty(
      "image",
      "https://example.com/legacy-cover.jpg"
    );
  });
});
