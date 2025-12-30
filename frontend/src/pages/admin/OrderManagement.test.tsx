import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import OrderManagement from "./OrderManagement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

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

describe("OrderManagement Integration", () => {
  const mockOrders = [
    {
      _id: "order123",
      user: { username: "BuyerOne", email: "buyer@test.com" },
      totalAmount: 59.99,
      status: "completed",
      items: [{ title: "CyberGame 2077", price: 59.99 }],
      createdAt: new Date().toISOString(),
    },
    {
      _id: "order456",
      user: { username: "BuyerTwo", email: "buyer2@test.com" },
      totalAmount: 19.99,
      status: "pending",
      items: [{ title: "Indie Gem", price: 19.99 }],
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    server.use(http.get("/api/orders", () => HttpResponse.json(mockOrders)));
  });

  it("renders order list", async () => {
    render(<OrderManagement />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("BuyerOne")).toBeInTheDocument();
      expect(screen.getByText(/CyberGame 2077/)).toBeInTheDocument();
      expect(screen.getByText(/\$59.99/)).toBeInTheDocument();
      expect(screen.getByText(/COMPLETED/i)).toBeInTheDocument();
    });
  });

  it("filters orders by search term", async () => {
    const user = userEvent.setup();
    render(<OrderManagement />, { wrapper: createWrapper() });

    await waitFor(() => screen.getByText("BuyerOne"));

    const searchInput = screen.getByPlaceholderText(
      /Buscar por ID de pedido o usuario/i
    );
    await user.type(searchInput, "BuyerTwo");

    expect(screen.queryByText("BuyerOne")).not.toBeInTheDocument();
    expect(screen.getByText("BuyerTwo")).toBeInTheDocument();
  });
});
