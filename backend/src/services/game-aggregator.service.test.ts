/**
 * @file game-aggregator.service.test.ts
 * @description Unit tests for GameAggregator Service.
 * Verifies data enrichment from RAWG and Steam, including fallback scenarios.
 * Uses jest.spyOn for robust internal module mocking.
 */
import { getCompleteGameData } from "./game-aggregator.service";
import * as rawgService from "./rawg.service";
import * as steamService from "./steam.service";

// Mock logger to avoid clutter
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("Game Aggregator Service", () => {
  const mockRawgData: any = {
    rawgId: 123,
    name: "Test Game",
    description: "A test game",
    cover: "image.jpg",
    genres: ["Action"],
    platforms: ["PC"],
    developers: ["Dev"],
    publishers: ["Pub"],
    released: "2024-01-01",
    metacritic: 85,
    rating: 4.5,
    stores: [
      {
        name: "Steam",
        url: "https://store.steampowered.com/app/12345/Test_Game/",
      },
    ],
  };

  const mockSteamData = {
    price_overview: {
      final: 1999, // $19.99
      currency: "USD",
      discount_percent: 0,
      initial: 1999,
    },
  };

  // Spies
  let getGameDetailsSpy: jest.SpyInstance;
  let extractSteamAppIdSpy: jest.SpyInstance;
  let getSteamGameDetailsSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup spies
    getGameDetailsSpy = jest.spyOn(rawgService, "getGameDetails");
    extractSteamAppIdSpy = jest.spyOn(steamService, "extractSteamAppId");
    getSteamGameDetailsSpy = jest.spyOn(steamService, "getSteamGameDetails");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should combine RAWG and Steam data successfully", async () => {
    // Arrange
    getGameDetailsSpy.mockResolvedValue(mockRawgData);
    extractSteamAppIdSpy.mockReturnValue(12345);
    getSteamGameDetailsSpy.mockResolvedValue(mockSteamData);

    // Act
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game");
    expect(result.steamAppId).toBe(12345);
    expect(result.price).toBe(19.99);
  });

  it("should return RAWG data only if Steam ID is missing", async () => {
    // Arrange
    const noSteamRawg = { ...mockRawgData, stores: [] };
    getGameDetailsSpy.mockResolvedValue(noSteamRawg);
    extractSteamAppIdSpy.mockReturnValue(null);

    // Act
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game");
    expect(result.steamAppId).toBeUndefined();
  });

  it("should return RAWG data (partial) if Steam API fails", async () => {
    // Arrange
    getGameDetailsSpy.mockResolvedValue(mockRawgData);
    extractSteamAppIdSpy.mockReturnValue(12345);
    // Explicitly returning rejected promise
    getSteamGameDetailsSpy.mockRejectedValue(new Error("Steam Down"));

    // Act
    // The service handles this rejection and should return partial data
    const result = await getCompleteGameData(123);

    // Assert
    expect(result.title).toBe("Test Game");
    expect(result.price).toBeUndefined(); // Fallback
  });

  it("should throw 404 if game not found in RAWG", async () => {
    // Arrange
    getGameDetailsSpy.mockResolvedValue(null);

    // Act & Assert
    await expect(getCompleteGameData(999)).rejects.toThrow("Game not found");
  });
});
