/**
 * user.model.ts
 * Mongoose model for user authentication and profiles.
 * Handles user data, role-based access control, and wishlist management.
 * Integrates with JWT authentication system for secure access.
 */
import mongoose, { Document, Schema, Types } from "mongoose";
import { UserRole } from "../types/enums";

/**
 * IUser Interface
 * Represents a user with authentication credentials and profile data.
 * Includes wishlist for tracking desired games before purchase.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string; // Unique username for login
  email: string; // Unique email for authentication
  password?: string; // Hashed password (optional for OAuth users)
  profilePicture: string; // URL to user's avatar image
  role: UserRole; // USER or ADMIN for access control
  wishlist: Types.ObjectId[]; // Array of Game IDs user wants to purchase
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document;

/**
 * User Schema
 * Defines validation rules and default values for user documents.
 * Enforces unique constraints on username and email.
 * Automatically adds createdAt and updatedAt timestamps.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Exported to auth, user controllers and services for user management operations
const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
