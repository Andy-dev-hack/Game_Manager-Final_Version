/**
 * @file payment.dto.ts
 * @description Data Transfer Objects for Payment operations.
 */

/**
 * Interface for creating a checkout session.
 */
export interface CreateCheckoutSessionDto {
  gameIds: string[];
}
