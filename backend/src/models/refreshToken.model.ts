/**
 * refreshToken.model.ts
 * Mongoose model for refresh tokens used in JWT authentication.
 * Implements token rotation strategy for enhanced security.
 * Tokens are revoked and replaced on each refresh to prevent token reuse attacks.
 */
import mongoose, { Schema, Document } from "mongoose";

/**
 * IRefreshToken Interface
 * Represents a refresh token with expiration and revocation tracking.
 * Includes virtual properties (isExpired, isActive) for token validation.
 */
export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId; // User who owns this token
  token: string; // JWT refresh token string
  expires: Date; // Token expiration date
  created: Date; // Token creation timestamp
  revoked?: Date; // When token was revoked (if applicable)
  replacedByToken?: string; // New token that replaced this one
  createdByIp?: string; // IP address that created the token
  isExpired: boolean; // Virtual: whether token has expired
  isActive: boolean; // Virtual: whether token is valid (not revoked/expired)
}

/**
 * RefreshToken Schema
 * Stores refresh tokens with expiration and revocation tracking.
 * Supports token rotation by tracking replacement tokens.
 */
const refreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  created: { type: Date, default: Date.now },
  revoked: { type: Date },
  replacedByToken: { type: String },
  createdByIp: { type: String },
});

/**
 * Virtual Property: isExpired
 * Checks if token has passed its expiration date.
 * @returns true if current time is past expiration date
 */
refreshTokenSchema.virtual("isExpired").get(function (this: IRefreshToken) {
  return Date.now() >= this.expires.getTime();
});

/**
 * Virtual Property: isActive
 * Checks if token is valid for use (not revoked and not expired).
 * @returns true if token has not been revoked and has not expired
 */
refreshTokenSchema.virtual("isActive").get(function (this: IRefreshToken) {
  return !this.revoked && !this.isExpired;
});

/**
 * JSON Serialization Configuration
 * Includes virtual properties and removes sensitive fields when converting to JSON.
 * Removes _id, id, and user fields for security when returning to client.
 */
refreshTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const retAny = ret as any;
    delete retAny._id;
    delete retAny.id;
    delete retAny.user;
  },
});

// Exported to auth service for token rotation and validation
export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
