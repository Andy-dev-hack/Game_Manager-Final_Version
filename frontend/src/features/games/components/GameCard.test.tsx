/**
 * @file GameCard.test.tsx
 * @description Unit tests for GameCard component.
 * Verifies rendering, navigation, and prefetching on hover.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameCard } from "./GameCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import type { Game } from "../../../services/games.service";

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Services
vi.mock("../../../services/games.service", () => ({
  gamesService: {
    getGameById: vi.fn().mockResolvedValue({ id: "game-1" }),
  },
}));

// Mock Wishlist/Cart Context to avoid complex provider setup if possible,
// but since we use Providers, we can just mock their internal hooks or keep providers.
// Let's use real providers with mocked internal services for simplicity in integration
// OR mock the hooks directly. Mocking hooks is cleaner for unit test.

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("../../collection/hooks/useIsGameOwned", () => ({
  useIsGameOwned: vi.fn().mockReturnValue(false),
}));

vi.mock("../../collection/hooks/useLibrary", () => ({
  useLibrary: () => ({ data: [] }),
}));

vi.mock("../../cart/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn() }),
  CartProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../wishlist/WishlistContext", () => ({
  useWishlist: () => ({
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
  }),
  WishlistProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockGame: Game = {
  _id: "game-1",
  title: "Test Game",
  price: 59.99,
  currency: "USD",
  description: "Desc",
  image: "test-image.jpg",
  platforms: ["PC"],
  genres: ["Action"],
  type: "game",
  releaseDate: "2023-01-01",
  developer: "Dev",
  publisher: "Pub",
  isOffer: false,
};

// Helper: access queryClient from test
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GameCard game={mockGame} />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("GameCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should render game title and price", () => {
    renderComponent();
    expect(screen.getByText("Test Game")).toBeInTheDocument();
    expect(screen.getByText("$59.99")).toBeInTheDocument();
  });

  it("should render abbreviated platform names", () => {
    const gameWithLongPlatform = {
      ...mockGame,
      platforms: ["PlayStation 5", "Nintendo Switch"],
    };
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GameCard game={gameWithLongPlatform} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("PS5")).toBeInTheDocument();
    expect(screen.getByText("Switch")).toBeInTheDocument();
  });

  it("should prefetch game details on mouse enter (Hover)", () => {
    const prefetchSpy = vi.spyOn(queryClient, "prefetchQuery");
    renderComponent();

    // We put onClick/onMouseEnter on the Card component which likely renders a div
    // Let's find by role or class if possible, or just the main container.
    // The Card component passes props down.

    // Simpler way: find the text and fire on its parent container
    // But Card component structure is: div > div(cover) + div(content)
    // Adjust selection if needed.
    // Let's try firing on the text element which is inside the card.
    // Events bubble up.

    fireEvent.mouseEnter(screen.getByText("Test Game"));

    expect(prefetchSpy).toHaveBeenCalledWith({
      queryKey: ["game", "game-1"],
      queryFn: expect.any(Function),
      staleTime: 300000,
    });
  });

  it("should navigate to details on click", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Test Game"));
    expect(mockNavigate).toHaveBeenCalledWith("/game/game-1");
  });
});
