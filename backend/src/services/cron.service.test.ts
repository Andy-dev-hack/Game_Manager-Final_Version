/**
 * @file cron.service.test.ts
 * @description Unit tests for background cron tasks.
 * Verifies cleanup logic for expired tokens and stale orders without DB interaction.
 */
import { cleanupExpiredTokens, cleanupPendingOrders } from "./cron.service";
import RefreshToken from "../models/refreshToken.model";
import Order from "../models/order.model";
import { OrderStatus } from "../types/enums";
import logger from "../utils/logger";

describe("Cron Service", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Silence logger during tests
    jest.spyOn(logger, "info").mockImplementation(() => logger);
    jest.spyOn(logger, "error").mockImplementation(() => logger);
    jest.spyOn(logger, "warn").mockImplementation(() => logger);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("cleanupExpiredTokens", () => {
    it("should delete tokens where expires < now", async () => {
      // Arrange
      const mockDate = new Date("2025-01-01T12:00:00Z");
      jest.setSystemTime(mockDate);

      const deleteManySpy = jest
        .spyOn(RefreshToken, "deleteMany")
        .mockResolvedValue({ deletedCount: 5 } as any);

      // Act
      await cleanupExpiredTokens();

      // Assert
      expect(deleteManySpy).toHaveBeenCalledWith({
        expires: { $lt: mockDate },
      });
    });
  });

  describe("cleanupPendingOrders", () => {
    it("should delete PENDING orders older than 24 hours", async () => {
      // Arrange
      const now = new Date("2025-01-02T12:00:00Z");
      const twentyFourHoursAgo = new Date("2025-01-01T12:00:00Z");
      jest.setSystemTime(now);

      const deleteManySpy = jest
        .spyOn(Order, "deleteMany")
        .mockResolvedValue({ deletedCount: 3 } as any);

      // Act
      await cleanupPendingOrders();

      // Assert
      expect(deleteManySpy).toHaveBeenCalledWith({
        status: OrderStatus.PENDING,
        createdAt: { $lt: twentyFourHoursAgo },
      });
    });
  });
});
