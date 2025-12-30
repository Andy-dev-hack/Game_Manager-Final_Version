/**
 * @file payment.controller.ts
 * @description Controller for handling payment requests.
 * Delegates logic to PaymentService.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as paymentService from "../services/payment.service";
import { CreateCheckoutSessionDto } from "../dtos/payment.dto";
import { AppError } from "../utils/AppError";

// Placeholder for real checkout (Stripe later)
export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    // Current implementation only supports simulation
    // This route might be used for real Stripe integration in future
    res
      .status(501)
      .json({ message: "Real checkout not implemented yet. Use simulate." });
  }
);

/**
 * Simulates a purchase without real payment processing.
 * Route: POST /api/payment/simulate
 */
export const simulatePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameIds }: CreateCheckoutSessionDto = req.body;
    const userId = req.userData?.id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!gameIds || !Array.isArray(gameIds)) {
      throw new AppError("Invalid gameIds provided", 400);
    }

    const result = await paymentService.simulatePurchase(userId, gameIds);

    res.status(200).json(result);
  }
);
