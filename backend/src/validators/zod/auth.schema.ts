/**
 * @file auth.schema.ts
 * @description Zod validation schemas for authentication.
 * ! SYNC MANUAL: This file must be manually synchronized with frontend/src/features/auth/schemas.ts
 * Destination: Used by auth routes via zod.middleware.ts
 */

import { z } from "zod";

/**
 * Login form validation schema
 * Validates email format and password minimum length
 * Destination: Used in user.routes.ts for login validation
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Registration form validation schema
 * Validates username, email, password, and password confirmation match
 * Destination: Used in user.routes.ts for registration validation
 */
export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error shown on confirmPassword field
  });

/**
 * Change password form validation schema
 * Validates new password and confirmation match
 * Note: Does not validate current password (backend endpoint doesn't require it)
 */
export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error shown on confirmPassword field
  });

/**
 * Update User form validation schema
 * Validates optional profile updates
 * Destination: Used in user.routes.ts for profile update
 */
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// TypeScript types inferred from Zod schemas
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
