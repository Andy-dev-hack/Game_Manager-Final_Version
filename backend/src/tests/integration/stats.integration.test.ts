/**
 * @file stats.integration.test.ts
 * @description Integration tests for Statistics Module.
 * Verifies Public Stats (Global counts) and Admin Dashboard (Revenue, Top Games).
 * Checks Role-Based Access Control for sensitive stats.
 */
import request from "supertest";
import app from "../../server";
import mongoose from "mongoose";
import { User, Game, Order, UserGame } from "../../models";
import { UserRole, GameStatus, OrderStatus } from "../../types/enums";
import { hashPassword } from "../../utils/password.util";

describe("Integration Test: Stats Module", () => {
  let adminToken: string;
  let userToken: string;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    // Connect to test DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Clean DB
    await User.deleteMany({});
    await Game.deleteMany({});
    await Order.deleteMany({});
    await UserGame.deleteMany({});

    // --- SETUP DATA ---

    // 1. Create ADMIN
    const adminPass = await hashPassword("admin123");
    const admin = await User.create({
      username: `adminStats_${uniqueSuffix}`,
      email: `adminStats_${uniqueSuffix}@test.com`,
      password: adminPass,
      role: UserRole.ADMIN,
    });

    // 2. Create USER
    const userPass = await hashPassword("user123");
    const user = await User.create({
      username: `userStats_${uniqueSuffix}`,
      email: `userStats_${uniqueSuffix}@test.com`,
      password: userPass,
      role: UserRole.USER,
    });

    // 3. Login to get tokens
    const resAdmin = await request(app)
      .post("/api/users/login")
      .send({
        email: `adminStats_${uniqueSuffix}@test.com`,
        password: "admin123",
      });
    adminToken = resAdmin.body.token;

    const resUser = await request(app)
      .post("/api/users/login")
      .send({
        email: `userStats_${uniqueSuffix}@test.com`,
        password: "user123",
      });
    userToken = resUser.body.token;

    // 4. Create dummy GAMES
    const game1 = await Game.create({
      title: "Expensive Game",
      price: 50,
      platforms: ["PC"],
      genres: ["Action"],
      released: new Date(),
    });

    const game2 = await Game.create({
      title: "Cheap Game",
      price: 10,
      platforms: ["PC"],
      genres: ["Indie"],
      released: new Date(),
    });

    // 5. Create ORDERS (Revenue)
    // Order 1: User bought Game 1 (50 EUR)
    await Order.create({
      user: user._id,
      items: [
        {
          game: game1._id,
          title: game1.title,
          price: 50,
          licenseKey: "KEY-123",
        },
      ],
      totalAmount: 50,
      status: OrderStatus.COMPLETED,
    });

    // Order 2: User bought Game 2 (10 EUR)
    await Order.create({
      user: user._id,
      items: [
        {
          game: game2._id,
          title: game2.title,
          price: 10,
          licenseKey: "KEY-456",
        },
      ],
      totalAmount: 10,
      status: OrderStatus.COMPLETED,
    });

    // 6. Create UserGame (Library Stats)
    await UserGame.create({
      user: user._id,
      game: game1._id,
      status: GameStatus.PLAYING,
      isOwned: true,
    });
  });

  afterAll(async () => {
    // Clean and Close
    await User.deleteMany({});
    await Game.deleteMany({});
    await Order.deleteMany({});
    await UserGame.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/stats/public", () => {
    it("should return public counters (users, games, active users)", async () => {
      const res = await request(app).get("/api/stats/public");
      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBeGreaterThanOrEqual(2); // Admin + User
      expect(res.body.totalGames).toBeGreaterThanOrEqual(2); // Game1 + Game2
    });
  });

  describe("GET /api/stats/dashboard (Admin)", () => {
    it("should return full dashboard stats for ADMIN", async () => {
      const res = await request(app)
        .get("/api/stats/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify Revenue (50 + 10 = 60)
      expect(res.body.revenue).toBe(60);

      // Verify Top Selling
      expect(res.body.topSelling).toBeDefined();
      expect(Array.isArray(res.body.topSelling)).toBe(true);

      // Verify AOV (60 / 2 = 30)
      expect(res.body.averageOrderValue).toBe(30);
    });

    it("should BLOCK Access for regular User (403)", async () => {
      const res = await request(app)
        .get("/api/stats/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should BLOCK Access for Unauthenticated (401)", async () => {
      const res = await request(app).get("/api/stats/dashboard");
      expect(res.status).toBe(401);
    });
  });
});
