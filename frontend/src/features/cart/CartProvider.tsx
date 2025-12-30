/**
 * CartProvider.tsx
 * Cart provider component.
 * Manages global cart state and provides it via CartContext.
 */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Game } from "../../services/games.service";
import { CartContext, type CartItem } from "./CartContext";

// localStorage key for cart persistence
const STORAGE_KEY = "game_manager_cart";

/**
 * CartProvider Component
 * Provides cart state and operations to child components.
 * Automatically persists cart to localStorage on changes.
 * Loads cart from localStorage on mount.
 *
 * @param children - Child components that need access to cart
 * @returns Cart context provider wrapping children
 */

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Add game to cart
   * Prevents duplicates by checking if game already exists.
   * Uses offer price if available, otherwise regular price.
   *
   * @param game - Game object to add to cart
   */
  const addItem = (game: Game) => {
    setItems((prev) => {
      // Prevent duplicate items
      if (prev.some((g) => g._id === game._id)) return prev;
      return [
        ...prev,
        {
          _id: game._id,
          title: game.title,
          price:
            game.isOffer && game.offerPrice !== undefined
              ? game.offerPrice
              : game.price,
          currency: game.currency,
          cover: game.assets?.cover,
        },
      ];
    });
  };

  /**
   * Remove item from cart by ID
   * @param id - Game ID to remove from cart
   */
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((g) => g._id !== id));
  };

  /**
   * Clear all items from cart
   */
  const clear = () => setItems([]);

  // Calculate count and total using useMemo for performance
  // Recalculates only when items array changes
  const { count, total } = useMemo(
    () => ({
      count: items.length,
      total: items.reduce((acc, item) => acc + (item.price || 0), 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
