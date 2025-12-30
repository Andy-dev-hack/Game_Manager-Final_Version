/**
 * @file auth.routes.test.ts
 * @description Integration tests for authentication routes.
 * Tests registration, login, and profile access.
 * Target: src/routes/user.routes.ts
 */
import request from "supertest";

import app from "../server";
import User from "../models/user.model";

describe("Auth Routes Integration Tests", () => {
  beforeAll(async () => {
    // Connection handled globally
    // Connect to a test database or ensure the main one is clean
    // For simplicity in this existing setup, we'll just clean the specific user
    await User.deleteMany({ email: "integration_test@example.com" });
  });

  afterAll(async () => {
    await User.deleteMany({ email: "integration_test@example.com" });
    // Connection closed globally
  });

  const testUser = {
    username: "integration_test_user",
    email: "integration_test@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  let token = "";

  test("POST /api/users/register should create a new user", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send(testUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
  });

  test("POST /api/users/login should return a token", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    token = response.body.token;
  });

  test("GET /api/users/profile should return user data with valid token", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe(testUser.email);
  });

  test("GET /api/users/profile should fail without token", async () => {
    const response = await request(app).get("/api/users/profile");

    expect(response.statusCode).toBe(401);
  });
});
