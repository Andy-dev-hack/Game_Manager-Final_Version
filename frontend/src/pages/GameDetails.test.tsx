/**
 * @file GameDetails.test.tsx
 * @description Integration tests for GameDetailsPage verifying Guest vs User access control.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GameDetails from "./GameDetails";
import { BrowserRouter } from "react-router-dom";
import * as gameHooks from "../features/games/hooks/useGameDetails";
import * as authContext from "../features/auth/AuthContext";
import * as wishlistContext from "../features/wishlist/WishlistContext";
import * as cartContext from "../features/cart/CartContext";
import * as collectionHooks from "../features/collection/hooks/useIsGameOwned";
import type { Game } from "../services/games.service";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// Mock React Router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "game-1" }),
  };
});

// Mock Dependencies
vi.mock("../features/auth/AuthContext");
vi.mock("../features/games/hooks/useGameDetails");
vi.mock("../features/wishlist/WishlistContext");
vi.mock("../features/cart/CartContext");
vi.mock("../features/collection/hooks/useIsGameOwned");

const mockGame: Game = {
  _id: "game-1",
  title: "Cyberpunk 2077",
  description: "Future RPG",
  price: 59.99,
  currency: "USD",
  image: "test.jpg",
  platforms: ["PC", "PS5"],
  genres: ["Action"],
  type: "game",
  releaseDate: "2020-12-10",
  developer: "CDPR",
  publisher: "CDPR",
  isOffer: false,
  assets: {
    cover: "cover.jpg",
    screenshots: ["s1.jpg"],
    videos: [],
  },
};

describe("GameDetails Page", () => {
  const mockAddItem = vi.fn();
  const mockAddToWishlist = vi.fn();
  const mockRemoveFromWishlist = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Mocks
    vi.mocked(gameHooks.useGameDetails).mockReturnValue({
      data: mockGame,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof gameHooks.useGameDetails>);

    vi.mocked(cartContext.useCart).mockReturnValue({
      addItem: mockAddItem,
    } as unknown as ReturnType<typeof cartContext.useCart>);

    vi.mocked(wishlistContext.useWishlist).mockReturnValue({
      addToWishlist: mockAddToWishlist,
      removeFromWishlist: mockRemoveFromWishlist,
      isInWishlist: () => false,
    } as unknown as ReturnType<typeof wishlistContext.useWishlist>);

    vi.mocked(collectionHooks.useIsGameOwned).mockReturnValue(false);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <GameDetails />
      </BrowserRouter>
    );

  it("should render game details correctly", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as unknown as ReturnType<typeof authContext.useAuth>);
    renderComponent();

    expect(screen.getByText("Cyberpunk 2077")).toBeInTheDocument();
    expect(screen.getAllByText("CDPR").length).toBeGreaterThan(0);
    expect(screen.getByText("$59.99")).toBeInTheDocument();
  });

  it("should disable actions in Guest Mode", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: false,
    } as unknown as ReturnType<typeof authContext.useAuth>);
    renderComponent();

    const buyBtn = screen.getByRole("button", { name: /buy now/i });
    const cartBtn = screen.getByRole("button", { name: /add to cart/i });
    const wishlistBtn = screen.getByRole("button", {
      name: /add to wishlist/i,
    });

    expect(buyBtn).toBeDisabled();
    expect(cartBtn).toBeDisabled();
    expect(wishlistBtn).toBeDisabled();
    expect(screen.getByText("Login to purchase")).toBeInTheDocument();
  });

  it("should enable actions in User Mode", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as unknown as ReturnType<typeof authContext.useAuth>);
    renderComponent();

    const buyBtn = screen.getByRole("button", { name: /buy now/i });
    const cartBtn = screen.getByRole("button", { name: /add to cart/i });
    const wishlistBtn = screen.getByRole("button", {
      name: /add to wishlist/i,
    });

    expect(buyBtn).not.toBeDisabled();
    expect(cartBtn).not.toBeDisabled();
    expect(wishlistBtn).not.toBeDisabled();
  });

  it("should handle cart addition", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as unknown as ReturnType<typeof authContext.useAuth>);
    renderComponent();

    const cartBtn = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(cartBtn);

    expect(mockAddItem).toHaveBeenCalledWith(mockGame);
  });

  it("should handle wishlist toggle", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as unknown as ReturnType<typeof authContext.useAuth>);
    renderComponent();

    const wishlistBtn = screen.getByRole("button", {
      name: /add to wishlist/i,
    });
    fireEvent.click(wishlistBtn);

    expect(mockAddToWishlist).toHaveBeenCalledWith(mockGame);
  });
});
