/**
 * @file CartContext.test.tsx
 * @description Unit tests for CartContext.
 * Verifies localStorage persistence, item management (add/remove), and total calculations.
 */

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartProvider } from "./CartProvider";
import { useCart } from "./CartContext";
import type { Game } from "../../services/games.service";

// Mocks
vi.mock("../../services/auth.service");
vi.mock("react-hot-toast");

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const mockGame1: Game = {
  _id: "game-1",
  title: "Test Game 1",
  price: 10,
  currency: "USD",
  image: "test1.jpg",
  description: "Test Description 1",
  type: "game",
  isOffer: false,
  platforms: ["PC"],
  genres: ["Action"],
  developer: "Dev 1",
  publisher: "Pub 1",
  releaseDate: new Date().toISOString(),
};

const mockGame2: Game = {
  _id: "game-2",
  title: "Test Game 2",
  price: 29.99,
  offerPrice: 15,
  currency: "USD",
  image: "test2.jpg",
  description: "Test Description 2",
  type: "game",
  isOffer: true,
  platforms: ["PS5"],
  genres: ["RPG"],
  developer: "Dev 2",
  publisher: "Pub 2",
  releaseDate: new Date().toISOString(),
};

const TestComponent = () => {
  const { items, addItem, removeItem, clear, total, count } = useCart();
  return (
    <div>
      <div data-testid="count">{count}</div>
      <div data-testid="total">{total}</div>
      <button onClick={() => addItem(mockGame1)}>Add Game 1</button>
      <button onClick={() => addItem(mockGame2)}>Add Game 2</button>
      <button onClick={() => removeItem("game-1")}>Remove Game 1</button>
      <button onClick={() => clear()}>Clear</button>
      <ul>
        {items.map((i) => (
          <li key={i._id} data-testid={`item-${i._id}`}>
            {i.title} - {i.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("CartContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("should initialize with empty cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
  });

  it("should add items and update total correctly (handling offers)", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const btn1 = screen.getByText("Add Game 1");
    const btn2 = screen.getByText("Add Game 2");

    act(() => {
      btn1.click();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("10"); // 10

    act(() => {
      btn2.click();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("2");
    // Game 2 has offer price 15. Total = 10 + 15 = 25
    expect(screen.getByTestId("total")).toHaveTextContent("25");
  });

  it("should prevent duplicate items", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const btn1 = screen.getByText("Add Game 1");

    act(() => {
      btn1.click();
      btn1.click(); // Click twice
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("10");
  });

  it("should persist to localStorage", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const btn1 = screen.getByText("Add Game 1");
    act(() => {
      btn1.click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "game_manager_cart",
      expect.stringContaining("game-1")
    );
  });

  it("should remove items and clear cart", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const btn1 = screen.getByText("Add Game 1");
    const btnRemove = screen.getByText("Remove Game 1");
    const btnClear = screen.getByText("Clear");

    act(() => btn1.click());
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    act(() => btnRemove.click());
    expect(screen.getByTestId("count")).toHaveTextContent("0");

    act(() => btn1.click());
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    act(() => btnClear.click());
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
