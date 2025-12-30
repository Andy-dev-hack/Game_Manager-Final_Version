/**
 * @file AuthContext.test.tsx
 * @description Unit tests for AuthContext verifying authentication flow, session management, and token handling.
 * Adheres to "Logic over UI" philosophy by mocking external services.
 */

import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./AuthContext";;
import { authService } from "../../services/auth.service";
import type { User } from "./types";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// Mock the auth service to isolate Context logic from API/network
vi.mock("../../services/auth.service", () => ({
  authService: {
    getStoredUser: vi.fn(),
    isAuthenticated: vi.fn(),
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock toast to prevent UI errors during testing
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Test Component to consume Context
const TestComponent = () => {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? "Loading" : "Idle"}</div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Guest"}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button
        onClick={() =>
          login({ email: "test@example.com", password: "password123" })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("AuthContext", () => {
  const mockUser: User = {
    _id: "123",
    email: "test@example.com",
    username: "TestUser",
    role: "user",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with no user if storage is empty", () => {
    vi.mocked(authService.getStoredUser).mockReturnValue(null);
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest");
    expect(screen.getByTestId("loading-state")).toHaveTextContent("Idle");
  });

  it("should initialize with user from storage and re-validate", async () => {
    // 1. Initial State (Optimistic from Storage)
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    // 2. Revalidation Call
    vi.mocked(authService.getProfile).mockResolvedValue({
      ...mockUser,
      username: "UpdatedUser",
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial render should show stored user (Optimistic)
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com"
    );

    // After effect, should show updated data
    await waitFor(() => {
      expect(authService.getProfile).toHaveBeenCalled();
    });
  });

  it("should handle successful login", async () => {
    vi.mocked(authService.getStoredUser).mockReturnValue(null);
    // Fix: AuthResponse structure is flat
    vi.mocked(authService.login).mockResolvedValue({
      message: "Success",
      token: "abc",
      refreshToken: "xyz",
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText("Login");

    await act(async () => {
      loginButton.click();
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Authenticated"
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com"
    );
  });

  it("should handle logout", async () => {
    // Start authenticated
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    // Ensure getProfile resolves to something stable so initAuth doesn't overwrite logout immediately if it races
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initialization to complete to avoid race condition where initAuth overwrites logout
    await waitFor(() => {
      expect(authService.getProfile).toHaveBeenCalled();
    });

    const logoutButton = screen.getByText("Logout");

    await act(async () => {
      logoutButton.click();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest");
    expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();
  });

  it("should sync state when auto-refresh happens (revalidation)", async () => {
    // Simulating the effect of refresh logic calling getProfile internally in AuthProvider
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser);
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authService.getProfile).toHaveBeenCalled();
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Authenticated"
    );
  });
});
