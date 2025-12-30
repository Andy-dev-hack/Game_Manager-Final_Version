/**
 * @file publicGame.routes.test.ts
 * @description Integration tests for public game routes.
 * Tests catalog search, filtering, and details.
 */
import request from "supertest";
import app from "../../server";
import mongoose from "mongoose";
import Game from "../../models/game.model";

describe("Public Game Routes", () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    // SECURITY: Use 'game-manager-test' logical database to isolate test data.
    // This allows using the same Cluster/Server as dev without wiping dev data.
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        dbName: "game-manager-test",
      });
    }
  });

  afterAll(async () => {
    await Game.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Game.create([
      {
        title: "Cyberpunk 2077",
        genres: ["RPG"],
        platforms: ["PC"],
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        price: 60,
        prices: { usd: 60 },
        released: new Date("2023-01-01"),
      },
      {
        title: "The Witcher 3",
        genres: ["RPG"],
        platforms: ["PS5"],
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        price: 20,
        prices: { usd: 20 },
        released: new Date("2023-01-01"),
      },
      {
        title: "Stardew Valley",
        genres: ["Simulation"],
        platforms: ["Switch"],
        developer: "ConcernedApe",
        publisher: "ConcernedApe",
        price: 15,
        prices: { usd: 15 },
        released: new Date("2023-01-01"),
      },
      {
        title: "Celeste",
        genres: ["Platformer"],
        platforms: ["Switch"],
        developer: "Maddy Makes Games",
        publisher: "Maddy Makes Games",
        price: 20,
        prices: { usd: 20 },
        released: new Date("2023-01-01"),
      },
      {
        title: "Adventure Game",
        genres: ["Adventure"],
        platforms: ["PC"],
        developer: "Dev Studio",
        publisher: "Pub Corp",
        price: 20,
        prices: { usd: 20 },
        released: new Date("2023-01-01"),
      },
    ]);
  });

  afterEach(async () => {
    await Game.deleteMany({});
  });

  it("should list games with pagination", async () => {
    const res = await request(app).get("/api/public/games");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it("should filter by search query", async () => {
    const res = await request(app).get("/api/public/games?query=Cyber");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Cyberpunk 2077");
  });

  it("should filter by genre", async () => {
    const res = await request(app).get("/api/public/games?genre=RPG");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("should filter by platform", async () => {
    const res = await request(app).get("/api/public/games?platform=Switch");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("should get game details by id", async () => {
    const game = await Game.findOne({ title: "Cyberpunk 2077" });
    const res = await request(app).get(`/api/public/games/${game?._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Cyberpunk 2077");
  });

  it("should return filters", async () => {
    const res = await request(app).get("/api/public/games/filters");
    expect(res.status).toBe(200);
    expect(res.body.genres).toContain("RPG");
    expect(res.body.platforms).toContain("PC");
  });
});
