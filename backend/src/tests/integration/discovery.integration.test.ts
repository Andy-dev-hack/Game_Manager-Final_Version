/**
 * @file discovery.integration.test.ts
 * @description Integration tests for Discovery Service (Unified Search).
 * Verifies Local Search, Eager Sync (Remote -> Local), and Error Handling.
 * Mocks RAWG service to avoid external network calls.
 */
import request from "supertest";
import app from "../../server";
import mongoose from "mongoose";
import { Game } from "../../models";
import * as RawgService from "../../services/rawg.service";
import * as AggregatorService from "../../services/game-aggregator.service";
import { UnifiedGame } from "../../dtos/discovery.dto";

// Mock services
jest.mock("../../services/rawg.service");
jest.mock("../../services/game-aggregator.service");

describe("Integration Test: Discovery Module", () => {
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    // Connect to test DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Clean DB before starting
    await Game.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup
    await Game.deleteMany({});
    await mongoose.connection.close();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/discovery", () => {
    it("should find existing LOCAL games", async () => {
      // 0. Setup Mock for this test (Empty RAWG results to avoid crash)
      (RawgService.searchGames as jest.Mock).mockResolvedValue([]);

      // 1. Setup: Create a local game
      await Game.create({
        title: `Local Zelda ${uniqueSuffix}`,
        description: "A local adventure",
        price: 59.99,
        genres: ["Adventure"],
        platforms: ["Switch"],
        image: "http://local.jpg",
        released: new Date(),
        rawgId: 1001,
      });

      // 2. Action: Search
      const res = await request(app).get(
        `/api/discovery?q=Local Zelda ${uniqueSuffix}`
      );

      // 3. Assertion
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0].title).toBe(`Local Zelda ${uniqueSuffix}`);
    });

    it("should EAGER SYNC new games from Remote (Mocked RAWG)", async () => {
      // 1. Setup: Mock RAWG response for a game that DOES NOT exist locally
      const mockRawgResponse = [
        {
          rawgId: 99999,
          name: `Remote Elden Ring ${uniqueSuffix}`,
          background_image: "http://remote.jpg", // Field name matches RAWGGameResult interface
          released: "2022-01-01",
        },
      ];
      (RawgService.searchGames as jest.Mock).mockResolvedValue(
        mockRawgResponse
      );

      // Mock Aggregator response (what returns from getCompleteGameData)
      (AggregatorService.getCompleteGameData as jest.Mock).mockResolvedValue({
        rawgId: 99999,
        title: `Remote Elden Ring ${uniqueSuffix}`,
        description: "Best game ever",
        image: "http://remote.jpg",
        platforms: ["PC"],
        genres: ["RPG"],
        released: new Date("2022-01-01"),
        price: 59.99,
        currency: "USD",
        score: 9.5,
        metacritic: 95,
        developer: "FromSoftware",
        publisher: "Bandai Namco",
        onSale: false,
        screenshots: [],
      });

      // 2. Action: Search for the remote game
      const res = await request(app).get(
        `/api/discovery?q=Remote Elden Ring ${uniqueSuffix}`
      );

      // 3. Assertion: Response should contain the game
      expect(res.status).toBe(200);

      // ... match logic
      const foundGame = res.body.results.find(
        (g: UnifiedGame) => g.title === `Remote Elden Ring ${uniqueSuffix}`
      );
      expect(foundGame).toBeDefined();

      // 4. CRITICAL VERIFICATION: Check if it was saved to MongoDB
      const dbGame = await Game.findOne({
        title: `Remote Elden Ring ${uniqueSuffix}`,
      });
      expect(dbGame).not.toBeNull();
      expect(dbGame?.description).toBe("Best game ever"); // Confirms full import happened
    });

    it("should gracefully handle RAWG errors and return manual local search", async () => {
      // 1. Setup: Mock RAWG failure
      (RawgService.searchGames as jest.Mock).mockRejectedValue(
        new Error("RAWG Down")
      );

      // 2. Action: Search
      const res = await request(app).get("/api/discovery?q=Whatever");

      // 3. Assertion
      expect(res.status).toBe(200); // Should NOT fail with 500
      expect(Array.isArray(res.body.results)).toBe(true);
    });
  });
});
