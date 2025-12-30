/**
 * order.model.ts
 * Mongoose model for purchase orders.
 * Tracks user game purchases with Stripe payment integration.
 * Stores order items with license keys for digital game delivery.
 */
import mongoose, { Document, Schema, Types } from "mongoose";
import { OrderStatus } from "../types/enums";
import { IUser } from "./user.model";
import { IGame } from "./game.model";

/**
 * IOrder Interface
 * Represents a purchase order for one or more games.
 * Linked to Stripe payment intent for payment processing.
 */
export interface IOrder extends Document {
  user: IUser["_id"]; // User who placed the order
  items: {
    game: IGame["_id"]; // Reference to purchased game
    title: string; // Game title snapshot at purchase time
    price: number; // Price paid at purchase time
    licenseKey: string; // Generated license key for game activation
  }[];
  totalAmount: number; // Total order amount
  currency: string; // Currency code (EUR, USD, etc.)
  status: OrderStatus; // PENDING, COMPLETED, or FAILED
  stripePaymentIntentId?: string; // Stripe payment intent ID for tracking
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Schema
 * Defines the structure for purchase orders.
 * Stores snapshot of game data at purchase time for historical accuracy.
 * Automatically adds timestamps for order tracking.
 */
const orderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        licenseKey: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "eur" },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

// Exported to order and payment controllers for purchase management
const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
