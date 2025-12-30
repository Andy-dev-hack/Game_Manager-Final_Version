import {
  searchGames,
  createCatalogGame,
  getFilters,
  getCatalogGameById,
} from "./game.service";
import Game from "../models/game.model";
import { AppError } from "../utils/AppError";

describe("Game Service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("searchGames", () => {
    it("should return paginated games with default parameters", async () => {
      // Spy on mongoose methods
      const mockFind = jest.spyOn(Game, "find");
      const mockCount = jest.spyOn(Game, "countDocuments");

      // Mock chainable return values
      const mockLimit = jest.fn().mockResolvedValue(["game1", "game2"]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      // Implementation of find returns the chain
      mockFind.mockReturnValue({ sort: mockSort } as any);
      // Implementation of count returns value
      mockCount.mockResolvedValue(15 as any);

      const result = await searchGames("", 1, 10);

      expect(Game.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ releaseDate: -1, _id: 1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: ["game1", "game2"],
        pagination: {
          total: 15,
          page: 1,
          pages: 2,
          limit: 10,
        },
      });
    });

    it("should apply filters correctly (genre, platform, price)", async () => {
      const mockFind = jest.spyOn(Game, "find");
      jest.spyOn(Game, "countDocuments").mockResolvedValue(0 as any);

      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      mockFind.mockReturnValue({ sort: mockSort } as any);

      await searchGames(
        "Zelda",
        1,
        10,
        "Action",
        "Switch",
        "price",
        "asc",
        true, // onSale
        20 // maxPrice
      );

      const expectedFilter = {
        $or: [
          { title: { $regex: "Zelda", $options: "i" } },
          { genre: { $regex: "Zelda", $options: "i" } },
          { developer: { $regex: "Zelda", $options: "i" } },
          { publisher: { $regex: "Zelda", $options: "i" } },
          { platforms: { $regex: "Zelda", $options: "i" } },
        ],
        genre: "Action",
        platform: "Switch",
        onSale: true,
        price: { $lte: 20 },
      };

      // We need to inspect the first argument of the first call to find
      // Note: The service uses 'filter as any' for price, so we match loosely or check properties
      const callArgs = (Game.find as jest.Mock).mock.calls[0][0];

      expect(callArgs).toMatchObject({
        genres: "Action",
        platforms: "Switch",
        onSale: true,
      });
      expect(callArgs.price).toEqual({ $lte: 20 });
      expect(callArgs.$or).toHaveLength(5);
    });
  });

  describe("getFilters", () => {
    it("should return sorted unique genres and platforms", async () => {
      const mockDistinct = jest.spyOn(Game, "distinct");

      mockDistinct.mockImplementation(((field: any) => {
        if (field === "genres") return Promise.resolve(["RPG", "Action", null]);
        if (field === "platforms") return Promise.resolve(["PC", "PS5", ""]);
        return Promise.resolve([]);
      }) as any);

      const result = await getFilters();

      expect(Game.distinct).toHaveBeenCalledWith("genres");
      expect(Game.distinct).toHaveBeenCalledWith("platforms");
      expect(result).toEqual({
        genres: ["Action", "RPG"],
        platforms: ["PC", "PS5"],
      });
    });
  });

  describe("createCatalogGame", () => {
    it("should create a new game if it does not exist", async () => {
      jest.spyOn(Game, "findOne").mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue({ title: "New Game" });

      // Spy on the prototype to catch new Game().save()
      jest.spyOn(Game.prototype, "save").mockImplementation(mockSave);

      const result = await createCatalogGame({ title: "New Game" });

      expect(Game.findOne).toHaveBeenCalledWith({ title: "New Game" });
      // We can't easily spy on the constructor directly without proxy,
      // but verifying save was called is sufficient for service logic
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ title: "New Game" });
    });

    it("should return existing game if found", async () => {
      const existingGame = { title: "Existing", _id: "123" };
      jest.spyOn(Game, "findOne").mockResolvedValue(existingGame as any);
      const saveSpy = jest.spyOn(Game.prototype, "save");

      const result = await createCatalogGame({ title: "Existing" });

      expect(saveSpy).not.toHaveBeenCalled();
      expect(result).toEqual(existingGame);
    });
  });
});
