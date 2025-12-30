/**
 * @file setupTestAdmin.ts
 * @description Utility script to create or promote a test admin user.
 * Usage: ts-node src/scripts/setupTestAdmin.ts
 */
import mongoose from "mongoose";
import { User, UserRole } from "../models";
import { hashPassword } from "../utils/password.util";
import { MONGO_URI } from "../config/env";

/**
 * Creates or promotes a test admin user for development/testing purposes
 */
const setupAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@test.com";
    const password = "admin123";
    const username = "admin";

    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new admin user...");
      const hashedPassword = await hashPassword(password);
      user = new User({
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
    } else {
      console.log("Updating existing user to admin...");
      user.role = UserRole.ADMIN;
    }

    await user.save();
    console.log("Admin user setup complete");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error setting up admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

setupAdmin();
