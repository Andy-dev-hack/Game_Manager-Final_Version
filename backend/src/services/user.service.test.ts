/**
 * @file user.service.test.ts
 * @description Unit tests for user service.
 * Target: src/services/user.service.ts
 */
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../services/user.service";
import User from "../models/user.model";
import Game from "../models/game.model";
import { AppError } from "../utils/AppError";

describe("User Service", () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations
  });

  const mockUserId = "507f1f77bcf86cd799439011";
  const mockGameId = "507f1f77bcf86cd799439012";

  describe("addToWishlist", () => {
    it("should add game to wishlist if user and game exist and not duplicate", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [],
        save: jest.fn(),
      } as any;
      const mockGame = { _id: mockGameId } as any;

      jest.spyOn(User, "findById").mockResolvedValue(mockUser);
      jest.spyOn(Game, "findById").mockResolvedValue(mockGame);

      const result = await addToWishlist(mockUserId, mockGameId);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Game.findById).toHaveBeenCalledWith(mockGameId);
      expect(mockUser.wishlist).toHaveLength(1);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Game added to wishlist");
    });

    it("should throw error if user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });

    it("should throw error if game not found", async () => {
      jest
        .spyOn(User, "findById")
        .mockResolvedValue({ _id: mockUserId } as any);
      jest.spyOn(Game, "findById").mockResolvedValue(null);

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("Game not found", 404)
      );
    });

    it("should throw error if game already in wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [mockGameId],
      } as any;
      jest.spyOn(User, "findById").mockResolvedValue(mockUser);
      jest
        .spyOn(Game, "findById")
        .mockResolvedValue({ _id: mockGameId } as any);

      await expect(addToWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("Game already in wishlist", 400)
      );
    });
  });

  describe("removeFromWishlist", () => {
    it("should remove game from wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: ["otherGameId", mockGameId],
        save: jest.fn(),
      } as any;

      jest.spyOn(User, "findById").mockResolvedValue(mockUser);

      const result = await removeFromWishlist(mockUserId, mockGameId);

      expect(mockUser.wishlist).toHaveLength(1);
      expect(mockUser.wishlist[0]).toBe("otherGameId");
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Game removed from wishlist");
    });

    it("should throw error if user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(removeFromWishlist(mockUserId, mockGameId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });

  describe("getWishlist", () => {
    it("should return paginated wishlist", async () => {
      const mockUser = {
        _id: mockUserId,
        wishlist: [{ title: "Game 1" }, { title: "Game 2" }],
      } as any;

      // Mock for count query
      const mockCountQuery = {
        populate: jest.fn().mockResolvedValue(mockUser),
      } as any;

      // Mock for paginated query
      const mockPaginatedQuery = {
        populate: jest.fn().mockResolvedValue(mockUser),
      } as any;

      jest
        .spyOn(User, "findById")
        .mockReturnValueOnce(mockUser) // First call for user check
        .mockReturnValueOnce(mockCountQuery) // Second call for count
        .mockReturnValueOnce(mockPaginatedQuery); // Third call for paginated data

      const result = await getWishlist(mockUserId);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it("should return empty result if user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(getWishlist(mockUserId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });
});
