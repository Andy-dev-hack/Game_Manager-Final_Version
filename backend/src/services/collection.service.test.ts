/**
 * @file collection.service.test.ts
 * @description Unit tests for collection service.
 * Target: src/services/collection.service.ts
 */
import {
  addToCollection,
  getCollection,
  updateCollectionItem,
  removeFromCollection,
} from "../services/collection.service";
import UserGame from "../models/userGame.model";
import { GameStatus } from "../types/enums";
import { AppError } from "../utils/AppError";
import * as GameService from "../services/game.service";

describe("Collection Service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addToCollection", () => {
    it("should add a game to the collection if not already present", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameId = "507f1f77bcf86cd799439012";
      const mockData = { status: GameStatus.PLAYING };

      jest
        .spyOn(GameService, "getCatalogGameById")
        .mockResolvedValue({} as any);
      jest.spyOn(UserGame, "findOne").mockResolvedValue(null);

      const mockSavedItem = {
        _id: "507f1f77bcf86cd799439013",
        user: mockUserId,
        game: mockGameId,
        ...mockData,
      };
      jest.spyOn(UserGame, "create").mockResolvedValue(mockSavedItem as any);

      const result = await addToCollection(mockUserId, mockGameId, mockData);

      expect(GameService.getCatalogGameById).toHaveBeenCalledWith(mockGameId);
      expect(UserGame.findOne).toHaveBeenCalledWith({
        user: mockUserId,
        game: mockGameId,
      });
      expect(result).toEqual(mockSavedItem);
    });

    it("should throw an error if the game is already in the collection", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameId = "507f1f77bcf86cd799439012";

      jest
        .spyOn(GameService, "getCatalogGameById")
        .mockResolvedValue({} as any);
      jest.spyOn(UserGame, "findOne").mockResolvedValue({
        _id: "item123",
      } as any);

      await expect(
        addToCollection(mockUserId, mockGameId, { status: GameStatus.PLAYING })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getCollection", () => {
    it("should return a list of games with pagination", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockItems = [{ _id: "item1", game: { title: "Game 1" } }];
      const mockCountResult = [{ total: 1 }];

      const aggregateSpy = jest.spyOn(UserGame, "aggregate");
      aggregateSpy
        .mockResolvedValueOnce(mockCountResult) // For count pipeline
        .mockResolvedValueOnce(mockItems); // For data pipeline

      const result = await getCollection(mockUserId, 1, 12);

      expect(aggregateSpy).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockItems);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
      expect(result.pagination.limit).toBe(12);
    });
  });

  describe("updateCollectionItem", () => {
    it("should update an item if it exists and belongs to the user", async () => {
      const mockId = "507f1f77bcf86cd799439013";
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockUpdates = { status: GameStatus.COMPLETED, score: 10 };

      const mockUpdatedItem = { _id: mockId, ...mockUpdates };

      // Mock chain: findOneAndUpdate(...).populate(...)
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockUpdatedItem),
      } as any;
      jest.spyOn(UserGame, "findOneAndUpdate").mockReturnValue(mockQuery);

      const result = await updateCollectionItem(
        mockId,
        mockUserId,
        mockUpdates
      );

      expect(UserGame.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockId, user: mockUserId },
        mockUpdates,
        { new: true }
      );
      expect(mockQuery.populate).toHaveBeenCalledWith("game");
      expect(result).toEqual(mockUpdatedItem);
    });

    it("should throw an error if item not found", async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      } as any;
      jest.spyOn(UserGame, "findOneAndUpdate").mockReturnValue(mockQuery);

      await expect(
        updateCollectionItem(
          "507f1f77bcf86cd799439013",
          "507f1f77bcf86cd799439011",
          {}
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe("removeFromCollection", () => {
    it("should remove an item if it exists", async () => {
      const mockId = "507f1f77bcf86cd799439013";
      const mockUserId = "507f1f77bcf86cd799439011";

      jest.spyOn(UserGame, "findOneAndDelete").mockResolvedValue({
        _id: mockId,
      } as any);

      await removeFromCollection(mockId, mockUserId);

      expect(UserGame.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockId,
        user: mockUserId,
      });
    });

    it("should throw an error if item not found", async () => {
      jest.spyOn(UserGame, "findOneAndDelete").mockResolvedValue(null);

      await expect(
        removeFromCollection(
          "507f1f77bcf86cd799439013",
          "507f1f77bcf86cd799439011"
        )
      ).rejects.toThrow(AppError);
    });
  });
});
