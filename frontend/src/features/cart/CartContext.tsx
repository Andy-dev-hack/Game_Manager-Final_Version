/**
 * CartContext.tsx
 * Shopping cart context provider with localStorage persistence.
 * Manages cart items, total calculation, and provides cart operations
 * (add, remove, clear) to the entire application.
 */
import { createContext, useContext } from "react";
import type { Game } from "../../services/games.service";

/**
 * Cart item interface
 * Simplified game data for cart storage and display
 */
export interface CartItem {
  _id: string; // Unique game identifier
  title: string; // Game title
  price: number; // Final price (considers offers)
  currency: string; // Currency code (e.g., "USD", "EUR")
  cover?: string; // Optional cover image URL
}

/**
 * Cart context type definition
 * Defines all cart operations and state available to consumers
 */
interface CartContextType {
  items: CartItem[]; // Current cart items
  addItem: (game: Game) => void; // Add game to cart
  removeItem: (id: string) => void; // Remove item by ID
  clear: () => void; // Clear all items
  count: number; // Total number of items
  total: number; // Total price of all items
}

// Create context with undefined default (requires provider)
export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

/**
 * CartProvider Component
 * Provides cart state and operations to child components.
 * Automatically persists cart to localStorage on changes.
 * Loads cart from localStorage on mount.
 *
 * @param children - Child components that need access to cart
 * @returns Cart context provider wrapping children
 */

/**
 * useCart Hook
 * Custom hook to access cart context.
 * Must be used within CartProvider.
 *
 * @returns Cart context value with items, operations, count, and total
 * @throws Error if used outside CartProvider
 */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
