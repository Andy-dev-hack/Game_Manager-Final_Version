/**
 * @file user.delete.test.ts
 * @description Integration tests for user deletion.
 * Tests admin-only user deletion and authorization.
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import User from "../models/user.model";
import { UserRole } from "../types/enums";
import jwt from "jsonwebtoken";
import UserGame from "../models/userGame.model";
import RefreshToken from "../models/refreshToken.model";
import Game from "../models/game.model";
import Order from "../models/order.model";

describe("DELETE /api/users/:id", () => {
  let adminToken: string;
  let userToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Create Admin
    const admin = await User.create({
      username: "admin_user_delete_test",
      email: "admin_user_delete@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string
    );

    // Create User (Caller)
    const user = await User.create({
      username: "user_user_delete_test",
      email: "user_user_delete@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: /_user_delete@test.com/ });
    await User.deleteMany({ email: "target_user@test.com" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const targetUser = await User.create({
      username: "target_user",
      email: "target_user@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    targetUserId = targetUser._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({ email: "target_user@test.com" });
    await UserGame.deleteMany({ user: targetUserId });
    await RefreshToken.deleteMany({ user: targetUserId });
  });

  it("should allow admin to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");

    const user = await User.findById(targetUserId);
    expect(user).toBeNull();
  });

  it("should allow admin to delete a user and cascade delete related data", async () => {
    const uniqueSuffix = Date.now();
    // 1. Create a game
    const game = await Game.create({
      title: "User Game",
      genres: ["Action"],
      platforms: ["PC"],
      price: 60,
      released: new Date(),
    });

    // 2. Add game to user's collection
    await UserGame.create({
      user: targetUserId,
      game: game._id,
      status: "playing",
      isOwned: true,
    });

    // 3. Create a refresh token
    await RefreshToken.create({
      user: targetUserId,
      token: "some_refresh_token",
      expires: new Date(),
    });

    // 4. Create an Order
    await Order.create({
      user: targetUserId,
      totalAmount: 59.99,
      items: [
        {
          game: game._id,
          title: "Cascade Test Game",
          price: 59.99,
          licenseKey: "TEST-KEY-123",
        },
      ],
      status: "completed",
    });

    // 5. Perform Delete
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");

    // 6. Verify User is gone
    const user = await User.findById(targetUserId);
    expect(user).toBeNull();

    // 7. Verify Cascade: UserGame is gone
    const userGame = await UserGame.findOne({ user: targetUserId });
    expect(userGame).toBeNull();

    // 8. Verify Cascade: RefreshToken is gone
    const token = await RefreshToken.findOne({ user: targetUserId });
    expect(token).toBeNull();

    // 9. Verify Cascade: Order is gone
    const order = await Order.findOne({ user: targetUserId });
    expect(order).toBeNull();

    // Cleanup game
    await Game.findByIdAndDelete(game._id);
  });

  it("should deny non-admin user to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if user not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
