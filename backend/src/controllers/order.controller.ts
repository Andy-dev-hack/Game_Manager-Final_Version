/**
 * @file order.controller.ts
 * @description Controller for order-related operations.
 * Delegates logic to OrderService.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as orderService from "../services/order.service";
import { AppError } from "../utils/AppError";

/**
 * Get logged-in user's orders
 * @route GET /api/orders/my-orders
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const orders = await orderService.getUserOrders(userId);

  res.status(200).json(orders);
});

/**
 * Get all orders (Admin Only)
 * @route GET /api/orders
 */
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    // TODO: Add role check here or in middleware
    const orders = await orderService.getAllOrdersService();
    res.status(200).json(orders);
  }
);
