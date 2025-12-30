/**
 * @file wishlist.test.ts
 * @description Integration tests for user wishlist management.
 * @target src/controllers/user.controller.ts
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { User, Game } from "../models";
import { UserRole } from "../types/enums";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
};

describe("Wishlist Integration Tests", () => {
  let userToken: string;
  let userId: string;
  let gameId: string;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    // Connection handled globally

    // Create Test User
    const user = await User.create({
      username: `wishlist_user_${uniqueSuffix}`,
      email: `wishlist_${uniqueSuffix}@test.com`,
      password: "password123",
      role: UserRole.USER,
    });
    userId = user._id.toString();
    userToken = generateToken(userId, user.role);

    // Create Test Game
    const game = await Game.create({
      title: `Wishlist Game ${uniqueSuffix}`,
      genres: ["Action"],
      platforms: ["Switch"],
      price: 49.99,
      released: new Date(),
    });
    gameId = game._id.toString();
  });

  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Game.findByIdAndDelete(gameId);
    // Connection closed globally
  });

  describe("POST /api/users/wishlist/:gameId", () => {
    it("should add a game to the user's wishlist", async () => {
      const res = await request(app)
        .post(`/api/users/wishlist/${gameId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/added to wishlist/i);
      expect(res.body.wishlist).toContain(gameId);
    });

    it("should prevent adding duplicate games to wishlist", async () => {
      const res = await request(app)
        .post(`/api/users/wishlist/${gameId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already in wishlist/i);
    });

    it("should return 404 for non-existent game", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/users/wishlist/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/users/wishlist", () => {
    it("should retrieve the user's wishlist with populated games", async () => {
      const res = await request(app)
        .get("/api/users/wishlist")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.total).toBe(1);
      expect(res.body.data[0]).toHaveProperty(
        "title",
        `Wishlist Game ${uniqueSuffix}`
      );
    });
  });

  describe("DELETE /api/users/wishlist/:gameId", () => {
    it("should remove a game from the wishlist", async () => {
      const res = await request(app)
        .delete(`/api/users/wishlist/${gameId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed from wishlist/i);
      expect(res.body.wishlist).not.toContain(gameId);
    });

    it("should confirm removal by fetching wishlist again", async () => {
      const res = await request(app)
        .get("/api/users/wishlist")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.body.pagination.total).toBe(0);
    });
  });
});
