/**
 * schemas.ts
 * Zod validation schemas for authentication forms.
 * Provides type-safe form validation for login and registration.
 * Used with react-hook-form for client-side validation.
 */

import { z } from "zod";

/**
 * Login form validation schema
 * Validates email format and password minimum length
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Registration form validation schema
 * Validates username, email, password, and password confirmation match
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

// TypeScript types inferred from Zod schemas
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

// Exported to LoginPage, RegisterPage, and ChangePasswordModal for form validation
