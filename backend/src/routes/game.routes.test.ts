/**
 * @file catalog.test.ts
 * @description Integration tests for catalog and collection features.
 * Tests game catalog and user collection management.
 * Target: src/routes/game.routes.ts, src/routes/collection.routes.ts
 */
import request from "supertest";

import app from "../server";
import User from "../models/user.model";
import Game from "../models/game.model";
import UserGame from "../models/userGame.model";

describe("Catalog & Collection Integration Tests", () => {
  let token: string;
  let userId: string;
  let gameId: string;

  beforeAll(async () => {
    // Connection handled globally
    await User.deleteMany({ email: "catalogtest@example.com" });
    await Game.deleteMany({ title: "Elden Ring" });

    const existingUser = await User.findOne({
      email: "catalogtest@example.com",
    });
    if (existingUser) {
      await UserGame.deleteMany({ user: existingUser._id });
    }

    // Create user and login
    await request(app).post("/api/users/register").send({
      username: "catalogtester",
      email: "catalogtest@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    // Promote to admin so we can create games
    await User.findOneAndUpdate(
      { email: "catalogtest@example.com" },
      { $set: { role: "admin" } }
    );

    const loginRes = await request(app).post("/api/users/login").send({
      email: "catalogtest@example.com",
      password: "password123",
    });

    token = loginRes.body.token;
    const user = await User.findOne({ email: "catalogtest@example.com" });
    if (user) userId = (user._id as any).toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: "catalogtest@example.com" });
    await Game.deleteMany({ title: "Elden Ring" });
    if (userId) {
      await UserGame.deleteMany({ user: userId });
    }
    // Connection closed globally
  });

  test("POST /api/games should create a game in catalog", async () => {
    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Elden Ring",
        genre: "RPG",
        platform: "PS5",
        developer: "FromSoftware",
        publisher: "Bandai Namco",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.game.title).toBe("Elden Ring");
    expect(res.body.game.developer).toBe("FromSoftware");
    expect(res.body.game.publisher).toBe("Bandai Namco");
    gameId = res.body.game._id;
  });

  test("POST /api/collection should add game to user collection", async () => {
    const res = await request(app)
      .post("/api/collection")
      .set("Authorization", `Bearer ${token}`)
      .send({
        gameId: gameId,
        status: "playing",
        hoursPlayed: 10,
        score: 9,
        review: "Great game!",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.item.game).toBe(gameId);
    expect(res.body.item.status).toBe("playing");
    expect(res.body.item.score).toBe(9);
    expect(res.body.item.review).toBe("Great game!");
    expect(res.body.item.review).toBe("Great game!");
  });

  test("GET /api/collection should list my games with details", async () => {
    const res = await request(app)
      .get("/api/collection")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.data[0].game.title).toBe("Elden Ring"); // Populated field
    expect(res.body.data[0].hoursPlayed).toBe(10);
  });

  test("GET /api/collection should filter by status", async () => {
    const res = await request(app)
      .get("/api/collection?status=playing")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe("playing");
  });

  test("PUT /api/collection/:id should update my progress", async () => {
    const collection = await request(app)
      .get("/api/collection")
      .set("Authorization", `Bearer ${token}`);
    const itemId = collection.body.data[0]._id;

    const res = await request(app)
      .put(`/api/collection/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "completed",
        hoursPlayed: 100,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.item.status).toBe("completed");
    expect(res.body.item.hoursPlayed).toBe(100);
  });
});
