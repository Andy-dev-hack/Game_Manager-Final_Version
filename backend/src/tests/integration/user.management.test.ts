import request from "supertest";
import app from "../../server";
import { User, UserRole, IUser } from "../../models";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env";

const generateTestToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

describe("User Management Routes", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    // Create Admin
    const admin = await User.create({
      username: "AdminUser",
      email: "admin_mgmt@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminId = admin._id.toString();
    adminToken = generateTestToken(admin);

    // Create Normal User
    const user = await User.create({
      username: "NormalUser",
      email: "user_mgmt@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userId = user._id.toString();
    userToken = generateTestToken(user);
  });

  afterAll(async () => {
    await User.deleteMany({
      email: { $in: ["admin_mgmt@test.com", "user_mgmt@test.com"] },
    });
  });

  describe("GET /api/users", () => {
    it("should allow Admin to get all users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThanOrEqual(2); // At least the 2 we created
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("page");
      expect(res.body).toHaveProperty("totalPages");

      // Check user structure
      const fetchedUser = res.body.users.find(
        (u: IUser) => u.email === "user_mgmt@test.com"
      );
      expect(fetchedUser).toBeDefined();
      expect(fetchedUser).not.toHaveProperty("password"); // Security check
      expect(fetchedUser).toHaveProperty("role");
    });

    it("should deny access to non-admin users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should deny access to unauthenticated requests", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).toBe(401);
    });
  });
});
