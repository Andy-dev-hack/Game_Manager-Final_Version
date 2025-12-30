import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatsSection } from "./StatsSection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { server } from "../../../mocks/server"; // Import MSW server
import { http, HttpResponse, delay } from "msw";

// Mock IntersectionObserver for Framer Motion 'whileInView'
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock React Icons
vi.mock("react-icons/fa", () => ({
  FaGamepad: () => <span data-testid="icon-gamepad" />,
  FaUsers: () => <span data-testid="icon-users" />,
  FaLayerGroup: () => <span data-testid="icon-collections" />,
  FaCode: () => <span data-testid="icon-code" />,
  FaBan: () => <span data-testid="icon-ban" />,
  FaShoppingBag: () => <span data-testid="icon-shopping-bag" />,
  FaMoneyBillWave: () => <span data-testid="icon-money" />,
}));

// Mock Translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "home.stats.games": "Games Available",
        "home.stats.users": "Active Gamers",
        "home.stats.collections": "Collections Created",
        "home.stats.open_source": "100% Open Source",
        "home.stats.trusted": "Trusted Platform",
        "home.stats.no_ads": "Zero Ads",
      };
      return translations[key] || key;
    },
  }),
}));

// Helper to render with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("StatsSection Component (MSW)", () => {
  it("renders static stats and value props correctly", async () => {
    // Default handler uses default values (5000 users, 15400 games)
    render(<StatsSection />, { wrapper: createWrapper() });

    // Value Props (Hardcoded in component)
    expect(screen.getByText("100% Open Source")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    expect(screen.getByText("Trusted Platform")).toBeInTheDocument();
    expect(screen.getByText("Zero Ads")).toBeInTheDocument();
  });

  it("fetches and displays dynamic stats from backend", async () => {
    // Override MSW handler for specific test values
    server.use(
      http.get("/api/stats/public", () => {
        return HttpResponse.json({
          totalUsers: 999,
          totalGames: 888,
          totalCollections: 777,
        });
      })
    );

    render(<StatsSection />, { wrapper: createWrapper() });

    // Should detect Labels
    expect(screen.getByText("Games Available")).toBeInTheDocument();
    expect(screen.getByText("Active Gamers")).toBeInTheDocument();
    expect(screen.getByText("Collections Created")).toBeInTheDocument();

    // Should eventually display the real numbers from MSW
    await waitFor(
      () => {
        expect(screen.getByText("888")).toBeInTheDocument(); // Games
        expect(screen.getByText("999")).toBeInTheDocument(); // Users
        expect(screen.getByText("777")).toBeInTheDocument(); // Collections
      },
      { timeout: 3000 }
    );
  });

  it("displays loading placeholder while fetching", async () => {
    // Simulate slow network
    server.use(
      http.get("/api/public/stats", async () => {
        await delay(200);
        return HttpResponse.json({
          totalUsers: 0,
          totalGames: 0,
          totalCollections: 0,
        });
      })
    );

    render(<StatsSection />, { wrapper: createWrapper() });

    // Should show "..." initially
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);

    // Wait for finish to avoid act warnings
    await waitFor(() => {
      expect(screen.queryByText("...")).not.toBeInTheDocument();
    });
  });
});
