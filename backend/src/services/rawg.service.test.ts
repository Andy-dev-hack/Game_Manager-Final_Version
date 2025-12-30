/**
 * @file rawg.service.test.ts
 * @description Unit tests for RAWG Service.
 * Mocks axios and node-cache to ensure no external requests are made.
 * Destination: Validation of src/services/rawg.service.ts
 */
import { AppError } from "../utils/AppError";

// 1. Setup Mocks for Cache
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();

jest.mock("node-cache", () => {
  return jest.fn().mockImplementation(() => ({
    get: mockCacheGet,
    set: mockCacheSet,
  }));
});

// 2. Setup Mocks for Axios
const mockGet = jest.fn();
const mockCreate = jest.fn(() => ({
  get: mockGet,
  defaults: { headers: { common: {} } }, // Add defaults to satisfy some axios usages
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: mockCreate,
    isAxiosError: jest.fn((payload) => payload?.isAxiosError === true),
  },
}));

// 3. Setup Mocks for Logger
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("RAWG Service", () => {
  let searchGames: any;
  let getGameDetails: any;
  let getScreenshots: any;
  let fetchPopularPCGames: any;

  beforeAll(() => {
    jest.clearAllMocks();
    // Require service AFTER mocking
    const service = require("../services/rawg.service");
    searchGames = service.searchGames;
    getGameDetails = service.getGameDetails;
    getScreenshots = service.getScreenshots;
    fetchPopularPCGames = service.fetchPopularPCGames;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchGames", () => {
    it("should return CACHED results if available (Cache Hit)", async () => {
      const cachedData = [{ id: 1, name: "Cached Mario" }];
      mockCacheGet.mockReturnValueOnce(cachedData);

      const result = await searchGames("Mario");

      expect(mockCacheGet).toHaveBeenCalled();
      expect(result).toEqual(cachedData);
      expect(mockGet).not.toHaveBeenCalled(); // API should NOT be called
    });

    it("should fetch from API if cache misses (Cache Miss)", async () => {
      mockCacheGet.mockReturnValueOnce(undefined); // Cache miss
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              name: "Game 1",
              background_image: "url1",
              rating: 4.5,
              platforms: [{ platform: { name: "PC" } }],
              genres: [{ name: "Action" }],
              released: "2023-01-01",
              metacritic: 85,
            },
          ],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await searchGames("Game 1");

      expect(mockGet).toHaveBeenCalledWith("/games", expect.any(Object));
      expect(mockCacheSet).toHaveBeenCalled(); // Should set cache
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Game 1");
    });

    it("should throw AppError when API call fails", async () => {
      mockCacheGet.mockReturnValueOnce(undefined);
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      await expect(searchGames("Game 1")).rejects.toThrow(AppError);
    });
  });

  describe("fetchPopularPCGames", () => {
    it("should return CACHED results if available", async () => {
      const cachedData = [{ id: 99, title: "Popular Game" }];
      mockCacheGet.mockReturnValueOnce(cachedData);

      const result = await fetchPopularPCGames();

      expect(result).toEqual(cachedData);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch from API on cache miss and cache the result", async () => {
      mockCacheGet.mockReturnValueOnce(undefined);
      const mockResponse = {
        data: {
          results: [{ id: 99, name: "Popular Game" }],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await fetchPopularPCGames();

      expect(mockGet).toHaveBeenCalledWith(
        "/games",
        expect.objectContaining({
          params: expect.objectContaining({ ordering: "-added" }),
        })
      );
      expect(mockCacheSet).toHaveBeenCalled();
      expect(result[0].title).toBe("Popular Game");
    });
  });

  describe("getGameDetails", () => {
    it("should return CACHED details if available", async () => {
      const cachedDetails = { name: "Zelda" };
      mockCacheGet.mockReturnValueOnce(cachedDetails);

      const result = await getGameDetails(123);

      expect(result).toEqual(cachedDetails);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return game details from API on cache miss", async () => {
      mockCacheGet.mockReturnValueOnce(undefined);
      const mockResponse = {
        data: {
          id: 1,
          name: "Game 1",
          description_raw: "Desc",
          background_image: "url1",
          platforms: [{ platform: { name: "PC" } }],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getGameDetails(1);

      expect(mockGet).toHaveBeenCalledWith("/games/1");
      expect(result.name).toBe("Game 1");
      expect(result.description).toBe("Desc");
      expect(mockCacheSet).toHaveBeenCalled();
    });
  });

  describe("getScreenshots", () => {
    it("should return CACHED screenshots if available", async () => {
      mockCacheGet.mockReturnValueOnce(["img1"]);
      const result = await getScreenshots(1);
      expect(result).toEqual(["img1"]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return screenshots from API on miss", async () => {
      mockCacheGet.mockReturnValueOnce(undefined);
      const mockResponse = {
        data: {
          results: [{ image: "img1" }, { image: "img2" }],
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await getScreenshots(1);

      expect(mockGet).toHaveBeenCalledWith("/games/1/screenshots", {
        params: { page_size: 6 },
      });
      expect(result).toEqual(["img1", "img2"]);
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it("should return empty array when API call fails", async () => {
      mockCacheGet.mockReturnValueOnce(undefined);
      mockGet.mockRejectedValueOnce(new Error("API Error"));

      const result = await getScreenshots(1);
      expect(result).toEqual([]);
    });
  });
});
