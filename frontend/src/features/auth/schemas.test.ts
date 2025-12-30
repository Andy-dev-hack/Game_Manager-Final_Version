/**
 * schemas.test.ts
 * Unit tests for authentication validation schemas.
 * Tests the Zod schemas used for form validation in auth flows.
 * Ensures password requirements and matching logic work correctly.
 */

import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, changePasswordSchema } from "./schemas";

/**
 * Test suite for loginSchema
 * Validates email format and password minimum length requirements
 */
describe("loginSchema", () => {
  it("should validate correct login credentials", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email format", () => {
    const invalidData = {
      email: "not-an-email",
      password: "password123",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid email");
    }
  });

  it("should reject password shorter than 6 characters", () => {
    const invalidData = {
      email: "test@example.com",
      password: "12345", // Only 5 characters
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 6 characters");
    }
  });
});

/**
 * Test suite for registerSchema
 * Validates username, email, password, and password confirmation matching
 */
describe("registerSchema", () => {
  it("should validate correct registration data", () => {
    const validData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject username shorter than 3 characters", () => {
    const invalidData = {
      username: "ab", // Only 2 characters
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 3 characters");
    }
  });

  it("should reject when passwords don't match", () => {
    const invalidData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different456", // Doesn't match
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("don't match");
    }
  });
});

/**
 * Test suite for changePasswordSchema (NEW)
 * Validates new password requirements and confirmation matching
 * Note: Does not validate current password (backend limitation)
 */
describe("changePasswordSchema", () => {
  it("should validate correct password change data", () => {
    const validData = {
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    };

    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject new password shorter than 6 characters", () => {
    const invalidData = {
      newPassword: "12345", // Only 5 characters
      confirmPassword: "12345",
    };

    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 6 characters");
    }
  });

  it("should reject when new password and confirmation don't match", () => {
    const invalidData = {
      newPassword: "newpass123",
      confirmPassword: "different456", // Doesn't match
    };

    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("don't match");
    }
  });

  it("should accept password exactly 6 characters (edge case)", () => {
    const validData = {
      newPassword: "123456", // Exactly 6 characters
      confirmPassword: "123456",
    };

    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

// Exported test suite validates all authentication schemas
// Ensures form validation works correctly before data reaches backend
