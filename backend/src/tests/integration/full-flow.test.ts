/**
 * @file full-flow.test.ts
 * @description End-to-end integration test for complete user journey.
 * Tests registration, login, game management, collection, and payments.
 */
import request from "supertest";
import app from "../../server";
import mongoose from "mongoose";
import { User, Game, UserGame, Order } from "../../models";
import RefreshToken from "../../models/refreshToken.model";
import { UserRole, GameStatus, OrderStatus } from "../../types/enums";

describe("Integration Test: Full User Journey", () => {
  let adminId: string;
  let userId: string;
  let adminToken: string;
  let userToken: string;
  let gameId: string;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
  });

  afterAll(async () => {
    // CLEANUP
    const idsToDelete = [adminId, userId].filter(Boolean);
    if (idsToDelete.length > 0) {
      await User.deleteMany({ _id: { $in: idsToDelete } });
      await RefreshToken.deleteMany({ user: { $in: idsToDelete } });
      await UserGame.deleteMany({ user: { $in: idsToDelete } });
      await Order.deleteMany({ user: { $in: idsToDelete } });
    }
    if (gameId) {
      await Game.findByIdAndDelete(gameId);
    }
    await mongoose.connection.close();
  });

  describe("1. Authentication Flow", () => {
    it("should register a new ADMIN user", async () => {
      const email = `admin_${uniqueSuffix}@test.com`;
      const { hashPassword } = require("../../utils/password.util");
      const hashedPassword = await hashPassword("password123");

      const admin = await User.create({
        username: `admin_${uniqueSuffix}`,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      adminId = admin._id.toString();

      const res = await request(app).post("/api/users/login").send({
        email,
        password: "password123",
      });

      expect(res.status).toBe(200);
      adminToken = res.body.token;
    });

    it("should register a new REGULAR user", async () => {
      const email = `user_${uniqueSuffix}@test.com`;
      const res = await request(app)
        .post("/api/users/register")
        .send({
          username: `user_${uniqueSuffix}`,
          email,
          password: "password123",
          confirmPassword: "password123",
        });

      expect(res.status).toBe(201);

      const resLogin = await request(app).post("/api/users/login").send({
        email,
        password: "password123",
      });

      expect(resLogin.status).toBe(200);
      userToken = resLogin.body.token;

      // Get user ID from token or profile
      const profileRes = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${userToken}`);
      userId = profileRes.body.user.id;
    });
  });

  describe("2. Game Management Flow (Admin)", () => {
    it("should create a new game", async () => {
      const res = await request(app)
        .post("/api/games")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("title", `Flow Game ${uniqueSuffix}`)
        .field("genre", "RPG")
        .field("platform", "PC")
        .field("price", 59.99); // Assuming price field exists or defaults

      expect(res.status).toBe(201);
      gameId = res.body.game._id;
    });
  });

  describe("3. Collection Flow (User)", () => {
    it("should add game to collection manually", async () => {
      const res = await request(app)
        .post("/api/collection")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          gameId,
          status: GameStatus.PLAYING,
          hoursPlayed: 5,
          score: 8,
        });

      expect(res.status).toBe(201);
      expect(res.body.item.status).toBe(GameStatus.PLAYING);
    });

    it("should update collection item status", async () => {
      // First get the item ID
      const listRes = await request(app)
        .get("/api/collection")
        .set("Authorization", `Bearer ${userToken}`);

      const itemId = listRes.body.data[0]._id;

      const res = await request(app)
        .put(`/api/collection/${itemId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          status: GameStatus.COMPLETED,
          hoursPlayed: 20,
        });

      expect(res.status).toBe(200);
      expect(res.body.item.status).toBe(GameStatus.COMPLETED);
    });
  });

  describe("4. Payment Flow (User)", () => {
    it("should process a mock payment for the game", async () => {
      // First, let's remove it from collection to simulate a fresh purchase
      // Or we can just buy it, and it should update 'isOwned' to true

      const res = await request(app)
        .post("/api/payments/checkout/simulate")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          gameIds: [gameId],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toBeDefined();
    });

    it("should verify game is now owned", async () => {
      const res = await request(app)
        .get("/api/collection")
        .set("Authorization", `Bearer ${userToken}`);

      const item = res.body.data.find(
        (i: any) => i.game._id === gameId || i.game.title.includes("Flow Game")
      );
      expect(item).toBeDefined();
      expect(item.isOwned).toBe(true);
      // Status should be reset to PENDING upon purchase as per payment logic
      expect(item.status).toBe(GameStatus.PENDING);
    });
  });
});
