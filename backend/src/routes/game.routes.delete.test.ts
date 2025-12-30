/**
 * @file game.delete.test.ts
 * @description Integration tests for game deletion.
 * Tests admin-only game deletion and authorization.
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import User from "../models/user.model";
import { UserRole } from "../types/enums";
import Game from "../models/game.model";
import jwt from "jsonwebtoken";
import UserGame from "../models/userGame.model";

describe("DELETE /api/games/:id", () => {
  let adminToken: string;
  let userToken: string;
  let gameId: string;

  beforeAll(async () => {
    // Ensure DB is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Create Admin
    const admin = await User.create({
      username: "admin_delete_test",
      email: "admin_delete@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string
    );

    // Create User
    const user = await User.create({
      username: "user_delete_test",
      email: "user_delete@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: /_delete@test.com/ });
    await Game.deleteMany({ title: "Game to Delete" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const game = await Game.create({
      title: "Game to Delete",
      genres: ["Adventure"],
      platforms: ["PC"],
      price: 10,
      released: new Date(),
    });
    gameId = game._id.toString();
  });

  afterEach(async () => {
    await Game.deleteMany({ title: "Game to Delete" });
    await UserGame.deleteMany({ game: gameId }); // Clean up UserGame entries associated with the deleted game
  });

  it("should allow admin to delete a game", async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Game deleted from catalog");

    const game = await Game.findById(gameId);
    expect(game).toBeNull();
  });

  it("should allow admin to delete a game and cascade delete related user games", async () => {
    // 1. Assign game to a user
    const user = await User.findOne({ email: "user_delete@test.com" });
    await UserGame.create({
      user: user!._id,
      game: gameId,
      status: "playing",
      isOwned: true,
    });

    // 2. Perform Delete
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Game deleted from catalog");

    // 3. Verify Game is gone
    const game = await Game.findById(gameId);
    expect(game).toBeNull();

    // 4. Verify Cascade: UserGame is gone
    const userGame = await UserGame.findOne({ game: gameId });
    expect(userGame).toBeNull();
  });

  it("should deny non-admin user to delete a game", async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if game not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/games/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
