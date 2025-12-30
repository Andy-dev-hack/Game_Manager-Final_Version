/**
 * @file game.update.test.ts
 * @description Integration tests for game updates.
 * Tests admin-only game updates and authorization.
 */
import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import User from "../models/user.model";
import { UserRole } from "../types/enums";
import Game from "../models/game.model";
import jwt from "jsonwebtoken";

describe("PUT /api/games/:id", () => {
  let adminToken: string;
  let userToken: string;
  let gameId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Create Admin
    const admin = await User.create({
      username: "admin_update_test",
      email: "admin_update@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string
    );

    // Create User
    const user = await User.create({
      username: "user_update_test",
      email: "user_update@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: /_update@test.com/ });
    await Game.deleteMany({ title: /Game to Update/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const game = await Game.create({
      title: "Game to Update",
      genres: ["Adventure"],
      platforms: ["PC"],
      price: 20,
      released: new Date(),
    });
    gameId = game._id.toString();
  });

  afterEach(async () => {
    await Game.deleteMany({ title: /Game to Update/ });
  });

  it("should allow admin to update a game", async () => {
    const res = await request(app)
      .put(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Game to Update (Updated)",
        genres: ["Updated Genre"],
      });

    expect(res.status).toBe(200);
    expect(res.body.game.title).toBe("Game to Update (Updated)");
    expect(res.body.game.genres).toContain("Updated Genre");

    const game = await Game.findById(gameId);
    expect(game?.title).toBe("Game to Update (Updated)");
  });

  it("should deny non-admin user to update a game", async () => {
    const res = await request(app)
      .put(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Hacked Title",
      });

    expect(res.status).toBe(403);
  });

  it("should return 404 if game not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/games/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "New Title",
      });

    expect(res.status).toBe(404);
  });
});
