import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { DealSection } from "./DealSection";
import { BrowserRouter } from "react-router-dom";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "home.free_games": "Free Games",
        "home.under_10": "Under $10",
        "home.view_all": "View All",
        "home.no_free_games": "No free games found.",
        "home.no_cheap_games": "No games under $10 found.",
        "home.loading": "Loading Deals...",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock IntersectionObserver for Framer Motion
beforeAll(() => {
  const MockObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
  vi.stubGlobal("IntersectionObserver", MockObserver);
});

// Mock useGames hook
vi.mock("../../games/hooks/useGames", () => ({
  useGames: ({ maxPrice }: { maxPrice: number }) => {
    // Free Games (maxPrice: 0)
    if (maxPrice === 0) {
      return {
        data: {
          data: [
            {
              _id: "1",
              title: "Free Game 1",
              price: 0,
              assets: { cover: "img" },
            },
          ],
        },
        isLoading: false,
      };
    }
    // Cheap Games (maxPrice: 10)
    if (maxPrice === 10) {
      return {
        data: {
          data: [
            {
              _id: "2",
              title: "Cheap Game 1",
              price: 9,
              assets: { cover: "img" },
            },
          ],
        },
        isLoading: false,
      };
    }
    return { data: { data: [] }, isLoading: false };
  },
}));

// Mock GameCard (to avoid deep rendering)
vi.mock("../../games/components/GameCard", () => ({
  GameCard: ({ game }: { game: { title: string } }) => (
    <div data-testid="game-card">{game.title}</div>
  ),
}));

describe("DealSection", () => {
  it("renders Flash Deals and Under $10 columns", () => {
    render(
      <BrowserRouter>
        <DealSection />
      </BrowserRouter>
    );
    expect(screen.getByText("Free Games")).toBeDefined();
    expect(screen.getByText("Under $10")).toBeDefined();
    expect(screen.getByText("Free Game 1")).toBeDefined();
    expect(screen.getByText("Cheap Game 1")).toBeDefined();
  });
});
