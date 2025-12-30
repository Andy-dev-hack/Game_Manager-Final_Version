/**
 * @file order.integration.test.ts
 * @description Integration tests for order creation and payment simulation.
 */
import request from "supertest";
import app from "../../server";
import { User, Game, Order } from "../../models";
import UserGame from "../../models/userGame.model";
import mongoose from "mongoose";

describe("Order & Payment Integration Tests", () => {
  let token: string;
  let userId: string;
  let gameIds: string[] = [];

  const testUser = {
    username: "ordertest",
    email: "ordertest@example.com",
    password: "password123",
  };

  beforeAll(async () => {
    // Clean up
    await User.deleteMany({ email: testUser.email });
    await Game.deleteMany({ title: { $regex: /Order Test Game/ } });

    // Register & Login
    await request(app)
      .post("/api/users/register")
      .send({ ...testUser, confirmPassword: testUser.password });
    const loginRes = await request(app).post("/api/users/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.token;
    userId = loginRes.body.user.id;

    // Create Games
    const game1 = await Game.create({
      title: "Game 1",
      genres: ["Action"],
      platforms: ["PC"],
      price: 10,
      currency: "USD",
      released: new Date(),
    });
    const game2 = await Game.create({
      title: "Game 2",
      genres: ["RPG"],
      platforms: ["PS5"],
      price: 20,
      currency: "USD",
      released: new Date(),
    });
    gameIds = [game1._id.toString(), game2._id.toString()];
  });

  afterAll(async () => {
    // Clean up
    if (userId) {
      await Order.deleteMany({ user: userId });
      await UserGame.deleteMany({ user: userId });
      await User.findByIdAndDelete(userId);
    }
    await Game.deleteMany({ _id: { $in: gameIds } });
  });

  describe("POST /api/payments/checkout/simulate", () => {
    it("should successfully simulate a purchase", async () => {
      const res = await request(app)
        .post("/api/payments/checkout/simulate")
        .set("Authorization", `Bearer ${token}`)
        .send({ gameIds });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orderId).toBeDefined();

      // Verify UserGame creation
      const userGames = await UserGame.find({ user: userId });
      expect(userGames.length).toBe(2);
      expect(userGames.some((ug) => ug.game.toString() === gameIds[0])).toBe(
        true
      );
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/payments/checkout/simulate")
        .send({ gameIds });

      expect(res.status).toBe(401);
    });

    it("should fail with invalid game IDs", async () => {
      const res = await request(app)
        .post("/api/payments/checkout/simulate")
        .set("Authorization", `Bearer ${token}`)
        .send({ gameIds: [new mongoose.Types.ObjectId().toString()] });

      // Controller throws 404 or 400 depending on implementation
      // Based on controller analysis: 404 "One or more games not found"
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/orders/my-orders", () => {
    it("should return user orders", async () => {
      const res = await request(app)
        .get("/api/orders/my-orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const order = res.body[0]; // Newest first
      expect(order.items.length).toBe(2);
      expect(order.totalAmount).toBe(30);
    });

    it("should fail without authentication", async () => {
      const res = await request(app).get("/api/orders/my-orders");
      expect(res.status).toBe(401);
    });
  });
});
