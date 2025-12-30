/**
 * @file steam.service.test.ts
 * @description Unit tests for Steam Service.
 * Uses jest.spyOn for axios to ensure no external requests are made.
 * Destination: Validation of src/services/steam.service.ts
 */
import axios from "axios";
import {
  searchSteamGames,
  getSteamGameDetails,
  extractSteamAppId,
} from "../services/steam.service";
import { AppError } from "../utils/AppError";

// Mock node-cache (Constructor mock)
jest.mock("node-cache", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }));
});

// Mock logger
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("Steam Service", () => {
  let axiosGetSpy: jest.SpyInstance;

  beforeAll(() => {
    // Spy on the default export's get method
    axiosGetSpy = jest.spyOn(axios, "get");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("searchSteamGames", () => {
    it("should return app ID when game is found", async () => {
      const mockResponse = {
        data: {
          items: [{ id: 12345, name: "Game 1" }],
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const result = await searchSteamGames("Game 1");

      expect(axiosGetSpy).toHaveBeenCalledWith(
        expect.stringContaining("storesearch"),
        expect.any(Object)
      );
      expect(result).toBe(12345);
    });

    it("should return null when no items found", async () => {
      const mockResponse = {
        data: { items: [] },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const result = await searchSteamGames("Unknown Game");
      expect(result).toBeNull();
    });

    it("should return null on API error", async () => {
      axiosGetSpy.mockRejectedValue(new Error("API Error"));

      const result = await searchSteamGames("Game 1");
      expect(result).toBeNull();
    });
  });

  describe("getSteamGameDetails", () => {
    it("should return game details when found", async () => {
      const appId = 12345;
      const mockResponse = {
        data: {
          [appId]: {
            success: true,
            data: {
              name: "Game 1",
              price_overview: { final: 1999, currency: "USD" },
            },
          },
        },
      };
      axiosGetSpy.mockResolvedValueOnce(mockResponse);

      const result = await getSteamGameDetails(appId);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        expect.stringContaining("appdetails"),
        expect.any(Object)
      );
      expect(result?.name).toBe("Game 1");
      expect(result?.price_overview?.final).toBe(1999);
    });

    it("should return null if success is false", async () => {
      const appId = 12345;
      const mockResponse = {
        data: {
          [appId]: { success: false },
        },
      };
      axiosGetSpy.mockResolvedValueOnce(mockResponse);

      const result = await getSteamGameDetails(appId);
      expect(result).toBeNull();
    });

    it("should throw AppError on API failure", async () => {
      axiosGetSpy.mockRejectedValueOnce(new Error("API Error"));

      await expect(getSteamGameDetails(12345)).rejects.toThrow(AppError);
    });
  });

  describe("extractSteamAppId", () => {
    it("should extract ID from valid URL", () => {
      const url = "https://store.steampowered.com/app/12345/Game_Name/";
      expect(extractSteamAppId(url)).toBe(12345);
    });

    it("should return null for invalid URL", () => {
      const url = "https://google.com";
      expect(extractSteamAppId(url)).toBeNull();
    });
  });
});
