import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardStats from "./DashboardStats";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

// Mock React Icons
vi.mock("react-icons/fa", () => ({
  FaGamepad: () => <span data-testid="icon-gamepad" />,
  FaUsers: () => <span data-testid="icon-users" />,
  FaShoppingBag: () => <span data-testid="icon-shopping-bag" />,
  FaMoneyBillWave: () => <span data-testid="icon-money" />,
  FaGem: () => <span data-testid="icon-gem" />,
  FaBalanceScale: () => <span data-testid="icon-balance" />,
  FaBookOpen: () => <span data-testid="icon-book" />,
  FaRocket: () => <span data-testid="icon-rocket" />,
}));

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

describe("DashboardStats Integration", () => {
  it("renders loading state initially", () => {
    render(<DashboardStats />, { wrapper: createWrapper() });
    expect(screen.getByText(/Cargando estadísticas/i)).toBeInTheDocument();
  });

  it("renders stats when data is loaded", async () => {
    // Setup MSW handlers
    server.use(
      http.get("/api/stats/dashboard", () => {
        return HttpResponse.json({
          revenue: 12345.67,
          topSelling: [
            { _id: "1", title: "Game A", totalSold: 100, revenue: 5000 },
          ],
          monthlyTrends: [{ _id: "2024-01", sales: 150, revenue: 7500 }],
        });
      }),
      http.get("/api/stats/public", () => {
        return HttpResponse.json({
          totalUsers: 50,
          totalGames: 20,
          totalCollections: 5,
        });
      })
    );

    render(<DashboardStats />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
      // $12345.67 formatted
      expect(screen.getByText("$12345.67")).toBeInTheDocument();

      expect(screen.getByText("Usuarios")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();

      expect(screen.getByText("Game A")).toBeInTheDocument();
    });
  });

  it("renders error state on failure", async () => {
    server.use(
      http.get("/api/stats/dashboard", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<DashboardStats />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });
});
