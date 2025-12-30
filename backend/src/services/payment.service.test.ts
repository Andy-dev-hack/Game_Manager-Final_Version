/**
 * @file payment.service.test.ts
 * @description Unit tests for payment service using jest.spyOn for robust mocking.
 * Complies with strict Layered Architecture (tests pure logic) and isolates DB operations.
 */
import { simulatePurchase } from "../services/payment.service";
import Order from "../models/order.model";
import UserGame from "../models/userGame.model";
import User from "../models/user.model";
import Game from "../models/game.model";
import * as mailService from "../services/mail.service";
import { OrderStatus } from "../types/enums";
import { AppError } from "../utils/AppError";

describe("Payment Service", () => {
  // Spies
  let userFindByIdSpy: jest.SpyInstance;
  let gameFindSpy: jest.SpyInstance;
  let orderCreateSpy: jest.SpyInstance;
  let userGameFindOneAndUpdateSpy: jest.SpyInstance;
  let sendEmailSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup spies before each test
    // Returns "Chainable" mock object for Mongoose queries if needed, or simple promise
    userFindByIdSpy = jest.spyOn(User, "findById");
    gameFindSpy = jest.spyOn(Game, "find");
    orderCreateSpy = jest.spyOn(Order, "create");
    userGameFindOneAndUpdateSpy = jest.spyOn(UserGame, "findOneAndUpdate");
    sendEmailSpy = jest.spyOn(mailService, "sendPurchaseConfirmation");
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original methods
  });

  describe("simulatePurchase", () => {
    it("should process payment, create order, and add games to library", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockGameIds = [
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013",
      ];

      const mockUser = {
        _id: mockUserId,
        email: "test@test.com",
        username: "testuser",
      };

      const mockGames = [
        {
          _id: "507f1f77bcf86cd799439012",
          price: 10,
          title: "Game 1",
          image: "img1.jpg",
        },
        {
          _id: "507f1f77bcf86cd799439013",
          price: 20,
          title: "Game 2",
          image: "img2.jpg",
        },
      ];

      // Mocks
      userFindByIdSpy.mockResolvedValue(mockUser);
      gameFindSpy.mockResolvedValue(mockGames);

      // Order creation mock
      const mockOrder = {
        _id: "order123",
        user: mockUserId,
        items: [],
        totalAmount: 30,
        status: OrderStatus.COMPLETED,
        toString: () => "order123",
      };
      orderCreateSpy.mockResolvedValue(mockOrder as any);

      // UserGame update mock
      userGameFindOneAndUpdateSpy.mockResolvedValue({});

      // Mail mock
      sendEmailSpy.mockResolvedValue(true);

      const result = await simulatePurchase(mockUserId, mockGameIds);

      // Assertions
      expect(userFindByIdSpy).toHaveBeenCalledWith(mockUserId);
      expect(gameFindSpy).toHaveBeenCalledWith({ _id: { $in: mockGameIds } });

      expect(orderCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUserId,
          totalAmount: 30,
          status: OrderStatus.COMPLETED,
        })
      );

      // Should check validation of order inputs implicitly via the call check above
      expect(userGameFindOneAndUpdateSpy).toHaveBeenCalledTimes(2);
      expect(sendEmailSpy).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.orderId).toBe("order123");
    });

    it("should throw error if input validation fails (no games)", async () => {
      // Even though we mock data, logic handles validation first.
      const mockUserId = "u1";
      const mockUser = { _id: "u1" };

      userFindByIdSpy.mockResolvedValue(mockUser);
      // Return empty array for games
      gameFindSpy.mockResolvedValue([]);

      await expect(simulatePurchase(mockUserId, [])).rejects.toThrow(AppError);
      // Should fail with 400 or 404 depending on logic
    });

    it("should throw error if user not found", async () => {
      userFindByIdSpy.mockResolvedValue(null);

      await expect(simulatePurchase("u1", ["g1"])).rejects.toThrow(
        "User not found"
      );
    });

    it("should complete successfully even if email fails", async () => {
      const mockUserId = "u1";
      const mockUser = { _id: "u1", email: "e@e.com", username: "u" };
      const mockGames = [{ _id: "g1", price: 10, title: "G1" }];

      userFindByIdSpy.mockResolvedValue(mockUser);
      gameFindSpy.mockResolvedValue(mockGames);
      orderCreateSpy.mockResolvedValue({
        _id: "o1",
        toString: () => "o1",
      } as any);
      userGameFindOneAndUpdateSpy.mockResolvedValue({});

      // Mock email failure
      sendEmailSpy.mockRejectedValue(new Error("SMTP Error"));

      const result = await simulatePurchase(mockUserId, ["g1"]);

      expect(result.success).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalled();
    });
  });
});
