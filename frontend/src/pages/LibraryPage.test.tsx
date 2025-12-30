/**
 * LibraryPage.test.tsx
 * Integration tests for the User Library.
 * Verifies that the library renders purchased games and handles empty states.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryPage from "./LibraryPage";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock paginated library hooks
const mockUseLibraryPaginated = vi.fn();
const mockUseLibraryUrl = vi.fn();

vi.mock("../features/collection/hooks/useLibraryPaginated", () => ({
  useLibraryPaginated: () => mockUseLibraryPaginated(),
}));

vi.mock("../features/collection/hooks/useLibraryUrl", () => ({
  useLibraryUrl: () => mockUseLibraryUrl(),
}));

// Mock GameCard to avoid CartProvider dependency
vi.mock("../features/games/components/GameCard", () => ({
  GameCard: ({ game }: { game: { title: string } }) => <div>{game.title}</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("LibraryPage", () => {
  beforeEach(() => {
    // Default URL state mock
    mockUseLibraryUrl.mockReturnValue({
      page: 1,
      query: "",
      genre: "",
      platform: "",
      status: "",
      sortBy: "updatedAt",
      order: "desc",
      setPage: vi.fn(),
      setSearch: vi.fn(),
      setGenre: vi.fn(),
      setPlatform: vi.fn(),
      setSort: vi.fn(),
      clearAll: vi.fn(),
    });
  });

  it("renders loading state", () => {
    mockUseLibraryPaginated.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<LibraryPage />);

    expect(screen.getByText(/Loading your library/i)).toBeInTheDocument();
  });

  it("renders empty state", () => {
    mockUseLibraryPaginated.mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 20 },
      },
      isLoading: false,
    });

    renderWithProviders(<LibraryPage />);

    expect(screen.getByText(/Your library is empty/i)).toBeInTheDocument();
  });

  it("renders purchased games", () => {
    mockUseLibraryPaginated.mockReturnValue({
      data: {
        data: [
          {
            _id: "1",
            game: { _id: "g1", title: "Elden Ring", image: "elden.jpg" },
            status: "playing",
          },
          {
            _id: "2",
            game: { _id: "g2", title: "Cyberpunk 2077", image: "cp.jpg" },
            status: "completed",
          },
        ],
        pagination: { total: 2, pages: 1, page: 1, limit: 20 },
      },
      isLoading: false,
    });

    renderWithProviders(<LibraryPage />);

    expect(screen.getByText("Elden Ring")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk 2077")).toBeInTheDocument();
  });
});
