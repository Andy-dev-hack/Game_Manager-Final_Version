/**
 * @file CheckoutPage.test.tsx
 * @description Integration tests for CheckoutPage verifying purchase flow, cart processing, and redirections.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckoutPage from "./CheckoutPage";
import { BrowserRouter } from "react-router-dom";
import * as cartContext from "../features/cart/CartContext";
import * as gameHooks from "../features/games/hooks/useGameDetails";
import * as checkoutHooks from "../features/checkout/hooks/useCheckout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

const mockNavigate = vi.fn();
// Fix 1: Properly type mutable mock params
const mockParams: { id: string | undefined } = { id: undefined };

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

vi.mock("../features/cart/CartContext");
vi.mock("../features/games/hooks/useGameDetails");
vi.mock("../features/checkout/hooks/useCheckout");

// Mock window.alert
window.alert = vi.fn();

const mockGame = {
  _id: "game-1",
  title: "Elden Ring",
  price: 60,
  currency: "USD",
  assets: { cover: "cover.jpg" },
  isOffer: false,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe("CheckoutPage", () => {
  const mockPurchase = vi.fn();
  const mockClearCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = undefined;

    vi.mocked(checkoutHooks.useCheckout).mockReturnValue({
      mutate: mockPurchase,
      isPending: false,
    } as unknown as ReturnType<typeof checkoutHooks.useCheckout>);

    vi.mocked(cartContext.useCart).mockReturnValue({
      items: [],
      clear: mockClearCart,
    } as unknown as ReturnType<typeof cartContext.useCart>);

    vi.mocked(gameHooks.useGameDetails).mockReturnValue({
      data: null,
      isLoading: false,
    } as unknown as ReturnType<typeof gameHooks.useGameDetails>);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CheckoutPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

  it("should render single game checkout when ID is present", () => {
    // Setup scenarios
    mockParams.id = "game-1";
    vi.mocked(gameHooks.useGameDetails).mockReturnValue({
      data: mockGame,
      isLoading: false,
    } as unknown as ReturnType<typeof gameHooks.useGameDetails>);

    renderComponent();

    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    expect(screen.getAllByText("$60.00").length).toBeGreaterThan(0); // Appears in list and total
  });

  it("should render cart checkout when ID is missing", () => {
    mockParams.id = undefined;
    vi.mocked(cartContext.useCart).mockReturnValue({
      items: [mockGame, { ...mockGame, _id: "game-2", title: "Sekiro" }],
      clear: mockClearCart,
    } as unknown as ReturnType<typeof cartContext.useCart>);

    renderComponent();

    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    expect(screen.getByText("Sekiro")).toBeInTheDocument();
    expect(screen.getByText("$120.00")).toBeInTheDocument(); // Total
  });

  it("should handle purchase success and redirect", async () => {
    mockParams.id = "game-1";
    vi.mocked(gameHooks.useGameDetails).mockReturnValue({
      data: mockGame,
      isLoading: false,
    } as unknown as ReturnType<typeof gameHooks.useGameDetails>);

    // Mock implementation of mutate calling onSuccess immediately
    mockPurchase.mockImplementation((_ids, options) => {
      options.onSuccess();
    });

    renderComponent();

    const confirmBtn = screen.getByText("Confirm Purchase");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockPurchase).toHaveBeenCalledWith(["game-1"], expect.any(Object));
    });

    // Modal Should Appear
    expect(screen.getByText("Purchase Successful!")).toBeInTheDocument();

    // Click Go to Library
    const libraryBtn = screen.getByText("Go to Library");
    fireEvent.click(libraryBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/library");
  });

  it("should clear cart on successful cart purchase", async () => {
    mockParams.id = undefined;
    vi.mocked(cartContext.useCart).mockReturnValue({
      items: [mockGame],
      clear: mockClearCart,
    } as unknown as ReturnType<typeof cartContext.useCart>);

    mockPurchase.mockImplementation((_ids, options) => {
      options.onSuccess();
    });

    renderComponent();

    const confirmBtn = screen.getByText("Confirm Purchase");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  it("should handle purchase failure", async () => {
    mockParams.id = "game-1";
    vi.mocked(gameHooks.useGameDetails).mockReturnValue({
      data: mockGame,
      isLoading: false,
    } as unknown as ReturnType<typeof gameHooks.useGameDetails>);

    mockPurchase.mockImplementation((_ids, options) => {
      options.onError(new Error("Failed"));
    });

    renderComponent();

    const confirmBtn = screen.getByText("Confirm Purchase");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Purchase failed. Please try again."
      );
    });

    expect(screen.queryByText("Purchase Successful!")).not.toBeInTheDocument();
  });
});
