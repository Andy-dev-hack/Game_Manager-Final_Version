/**
 * @file payment.routes.ts
 * @description Routes for payment processing.
 */
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import checkAuth from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/payments/checkout:
 *   post:
 *     summary: Process a mock payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameIds]
 *             properties:
 *               gameIds:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
import { createCheckoutSessionSchema } from "../validators/zod/order.schema";
import { validateZod } from "../middleware/zod.middleware";

router.post(
  "/checkout",
  checkAuth,
  validateZod(createCheckoutSessionSchema),
  paymentController.createCheckoutSession
);

/**
 * @swagger
 * /api/payments/checkout/simulate:
 *   post:
 *     summary: Simulate a purchase
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameIds]
 *             properties:
 *               gameIds:
 *                 type: array
 *     responses:
 *       200:
 *         description: Purchase simulated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Purchase simulated successfully"
 *                 orderId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User or Games not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/checkout/simulate",
  checkAuth,
  validateZod(createCheckoutSessionSchema), // Same validation (gameIds required)
  paymentController.simulatePurchase
);

export default router;
