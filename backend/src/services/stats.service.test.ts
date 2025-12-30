/**
 * @file stats.service.test.ts
 * @description Unit tests for StatsService.
 * Uses jest.spyOn() to mock Mongoose models safely (Zero-Fragility).
 */
import { getGlobalStats } from "./stats.service";
import User from "../models/user.model";
import Game from "../models/game.model";
import UserGame from "../models/userGame.model";
import logger from "../utils/logger";

// Mock logger to keep test output clean
jest.mock("../utils/logger");

describe("StatsService", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Critical: Clean up spies
  });

  describe("getGlobalStats", () => {
    it("should aggregate counts from all models", async () => {
      // Arrange: Spy on countDocuments
      const userSpy = jest.spyOn(User, "countDocuments").mockResolvedValue(100);
      const gameSpy = jest.spyOn(Game, "countDocuments").mockResolvedValue(555);
      const collectionSpy = jest
        .spyOn(UserGame, "countDocuments")
        .mockResolvedValue(2000);

      // Act
      const result = await getGlobalStats();

      // Assert
      expect(result).toEqual({
        totalUsers: 100,
        totalGames: 555,
        totalCollections: 2000,
      });

      // Verify calls
      expect(userSpy).toHaveBeenCalled();
      expect(gameSpy).toHaveBeenCalled();
      expect(collectionSpy).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "StatsService: Fetching global statistics"
      );
    });

    it("should handle database errors gracefully (propagation)", async () => {
      // Arrange: Force an error
      jest
        .spyOn(User, "countDocuments")
        .mockRejectedValue(new Error("DB Error"));

      // Act & Assert
      await expect(getGlobalStats()).rejects.toThrow("DB Error");
    });
  });
});
