/**
 * @file api.contract.test.ts
 * @description API Contract Tests verifying that the service layer sends the correct payloads to the backend.
 * Uses MSW to intercept requests and inspect the body/params.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { authService } from "./auth.service";

describe("API Contracts", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("Auth: Login sends correct payload", async () => {
    let capturedBody: { email?: string; password?: string } | undefined;

    server.use(
      http.post("/api/users/login", async ({ request }) => {
        capturedBody = (await request.json()) as {
          email?: string;
          password?: string;
        };
        return HttpResponse.json({
          token: "mock-token",
          refreshToken: "mock-refresh",
          user: { id: "1", email: "test@example.com", role: "user" },
        });
      })
    );

    await authService.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(capturedBody).toEqual({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("Auth: Register sends correct payload", async () => {
    let capturedBody: Record<string, unknown> | undefined;

    server.use(
      http.post("/api/users/register", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          token: "mock-token",
          refreshToken: "mock-refresh",
          user: { id: "2", email: "new@example.com", role: "user" },
        });
      })
    );

    const registerData = {
      username: "NewUser",
      email: "new@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    await authService.register(registerData);

    expect(capturedBody).toEqual(registerData);
  });

  it("Auth: Profile request includes Authorization header", async () => {
    let capturedHeaders: Headers | undefined;

    // Setup existing token
    localStorage.setItem("token", "valid-jwt-token");

    server.use(
      http.get("/api/users/profile", ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({
          message: "Success",
          user: { id: "1", username: "Test" },
        });
      })
    );

    await authService.getProfile();

    expect(capturedHeaders?.get("Authorization")).toBe(
      "Bearer valid-jwt-token"
    );
  });
});
