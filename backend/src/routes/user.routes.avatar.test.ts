/**
 * @file user.avatar.test.ts
 * @description Integration tests for user profile updates and avatar uploads.
 * @target src/controllers/auth.controller.ts
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { User } from "../models";
import { UserRole } from "../types/enums";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import path from "path";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
};

describe("User Avatar & Profile Integration Tests", () => {
  let userToken: string;
  let userId: string;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Create Test User
    const user = await User.create({
      username: `avatar_user_${uniqueSuffix}`,
      email: `avatar_${uniqueSuffix}@test.com`,
      password: "password123",
      role: UserRole.USER,
    });
    userId = user._id.toString();
    userToken = generateToken(userId, user.role);
  });

  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await mongoose.connection.close();
  });

  describe("PUT /api/users/update", () => {
    it("should update basic profile info (username)", async () => {
      const newUsername = `updated_user_${uniqueSuffix}`;
      const res = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${userToken}`)
        .field("username", newUsername);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("username", newUsername);

      // Verify DB
      const updatedUser = await User.findById(userId);
      expect(updatedUser?.username).toBe(newUsername);
    });

    it("should upload an avatar image successfully", async () => {
      // Create a dummy buffer simulating an image
      const buffer = Buffer.from("fake-image-content");

      const res = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("image", buffer, "avatar.jpg");

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("profilePicture");
      expect(res.body.user.profilePicture).toContain("uploads/"); // Should be a local path

      // Verify DB
      const updatedUser = await User.findById(userId);
      expect(updatedUser?.profilePicture).toMatch(/uploads\//);
    });

    it("should handle update without image", async () => {
      const res = await request(app)
        .put("/api/users/update")
        .set("Authorization", `Bearer ${userToken}`)
        .field("username", `final_user_${uniqueSuffix}`);

      expect(res.status).toBe(200);
      // Image should persist (not explicitly tested here but behavior implies it shouldn't clear it)
    });
  });
});
