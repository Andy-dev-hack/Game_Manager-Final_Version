/**
 * @file order.schema.ts
 * @description Zod validation schemas for order and payment processing.
 * Destination: Used by payment.routes.ts via zod.middleware.ts
 */

import { z } from "zod";

/**
 * Schema for creating a checkout session or simulating a purchase
 * Destination: POST /api/payments/checkout, POST /api/payments/checkout/simulate
 */
export const createCheckoutSessionSchema = z.object({
  gameIds: z
    .array(z.string().min(1, "Game ID cannot be empty"))
    .min(1, "gameIds must be a non-empty array"),
});

// Types
export type CreateCheckoutSessionSchemaType = z.infer<
  typeof createCheckoutSessionSchema
>;
