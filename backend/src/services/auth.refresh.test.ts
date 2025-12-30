/**
 * @file auth.refresh.test.ts
 * @description Integration tests for refresh token rotation.
 * Tests token refresh flow and revocation of old tokens.
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { User } from "../models";
import RefreshToken from "../models/refreshToken.model";

describe("Refresh Token Flow", () => {
  let userId: string;
  let userEmail: string;
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    // Setup logic if needed, but connection is handled globally
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await User.findByIdAndDelete(userId);
      await RefreshToken.deleteMany({ user: userId });
    }
    // await mongoose.connection.close(); // Handled globally
  });

  it("should register and login to get tokens", async () => {
    const uniqueSuffix = Date.now();
    userEmail = `refresh_test_${uniqueSuffix}@test.com`;

    // Register
    await request(app)
      .post("/api/users/register")
      .field("username", `refresh_user_${uniqueSuffix}`)
      .field("email", userEmail)
      .field("password", "password123")
      .field("confirmPassword", "password123");
    // The original instruction had a trailing comma here, which is a syntax error.
    // It has been removed to ensure syntactically correct output.

    // Login
    const res = await request(app).post("/api/users/login").send({
      email: userEmail,
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    accessToken = res.body.token;
    refreshToken = res.body.refreshToken;
    userId = res.body.user.id;
  });

  it("should refresh access token using valid refresh token", async () => {
    const res = await request(app).post("/api/users/refresh-token").send({
      token: refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    // expect(res.body.token).not.toBe(accessToken); // Might be same if executed within same second
    expect(res.body.refreshToken).not.toBe(refreshToken); // Should be rotated

    // Update for next test
    refreshToken = res.body.refreshToken;
    accessToken = res.body.token;
  });

  it("should fail when using a revoked (old) refresh token", async () => {
    // We need the OLD refresh token.
    // In the previous test, we updated `refreshToken` variable to the NEW one.
    // But we want to test the OLD one.
    // Let's get a fresh pair first to be sure.

    // Login again to get a fresh start for this specific test case
    const loginRes = await request(app).post("/api/users/login").send({
      email: userEmail,
      password: "password123",
    });
    const oldRefreshToken = loginRes.body.refreshToken;

    // Use it once to rotate it
    const refreshRes = await request(app)
      .post("/api/users/refresh-token")
      .send({
        token: oldRefreshToken,
      });
    expect(refreshRes.status).toBe(200);

    // Now try to use the OLD one again
    const reuseRes = await request(app).post("/api/users/refresh-token").send({
      token: oldRefreshToken,
    });

    expect(reuseRes.status).toBe(401); // Or 403 depending on implementation
  });
});
