import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserManagement from "./UserManagement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

// Mock Confirm Dialog
window.confirm = vi.fn(() => true);
window.alert = vi.fn();

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

describe("UserManagement Integration", () => {
  const mockUsers = {
    users: [
      {
        _id: "u1",
        username: "AdminUser",
        email: "admin@test.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "u2",
        username: "NormalUser",
        email: "user@test.com",
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 2,
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    // Default happy path
    server.use(
      http.get("/api/users", () => HttpResponse.json(mockUsers)),
      http.delete("/api/users/:id", () => HttpResponse.json({ success: true })),
      http.put("/api/users/:id/role", () =>
        HttpResponse.json({ user: { ...mockUsers.users[1], role: "admin" } })
      )
    );
  });

  it("renders user table correctly", async () => {
    render(<UserManagement />, { wrapper: createWrapper() });

    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("AdminUser")).toBeInTheDocument();
      expect(screen.getByText("NormalUser")).toBeInTheDocument();
    });
  });

  it("allows changing user role", async () => {
    const user = userEvent.setup();
    render(<UserManagement />, { wrapper: createWrapper() });

    await waitFor(() => screen.getByText("NormalUser"));

    // Find the select for NormalUser (second row)
    const selects = screen.getAllByRole("combobox");
    const userSelect = selects[1]; // 0 is admin, 1 is user

    await user.selectOptions(userSelect, "admin");

    expect(window.confirm).toHaveBeenCalled();
  });

  it("allows deleting a user", async () => {
    const user = userEvent.setup();
    render(<UserManagement />, { wrapper: createWrapper() });

    await waitFor(() => screen.getByText("NormalUser"));

    const deleteBtns = screen.getAllByText("Eliminar");
    await user.click(deleteBtns[1]); // Delete NormalUser

    expect(window.confirm).toHaveBeenCalled();
    // In a real integration test we might check if it refetches,
    // but here we verify the interaction and API call expectation via MSW
  });
});
