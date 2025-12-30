/**
 * ChangePasswordModal.test.tsx
 * Unit tests for the ChangePasswordModal component.
 * Tests basic rendering, user interactions, and modal behavior.
 * Focuses on simple, reliable tests without complex form mocking.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChangePasswordModal } from "./ChangePasswordModal";

/**
 * Mock external dependencies
 * Prevents actual API calls and side effects during testing
 */
vi.mock("../../../services/auth.service", () => ({
  authService: {
    updateProfile: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    refreshUser: vi.fn(),
  }),
}));

/**
 * Test suite for ChangePasswordModal component
 * Covers basic rendering and user interactions
 */
describe("ChangePasswordModal", () => {
  const mockOnClose = vi.fn();

  /**
   * Reset all mocks before each test
   * Ensures tests don't interfere with each other
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Modal renders when open
   * Verifies all essential UI elements are present
   */
  it("should render modal when isOpen is true", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole("heading", { name: "Change Password" })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter new password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm new password")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Change Password/i })
    ).toBeInTheDocument();
  });

  /**
   * Test: Modal doesn't render when closed
   * Verifies conditional rendering works correctly
   */
  it("should not render modal when isOpen is false", () => {
    render(<ChangePasswordModal isOpen={false} onClose={mockOnClose} />);

    expect(
      screen.queryByRole("heading", { name: "Change Password" })
    ).not.toBeInTheDocument();
  });

  /**
   * Test: Close button functionality
   * Verifies clicking close button calls onClose callback
   */
  it("should call onClose when close button is clicked", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Close modal");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Cancel button functionality
   * Verifies cancel button also closes the modal
   */
  it("should call onClose when cancel button is clicked", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Form inputs are editable
   * Verifies users can type in password fields
   */
  it("should allow typing in password inputs", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const newPasswordInput = screen.getByPlaceholderText(
      "Enter new password"
    ) as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Confirm new password"
    ) as HTMLInputElement;

    // Type in inputs
    fireEvent.change(newPasswordInput, { target: { value: "newpass123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "newpass123" } });

    // Verify values were set
    expect(newPasswordInput.value).toBe("newpass123");
    expect(confirmPasswordInput.value).toBe("newpass123");
  });

  /**
   * Test: Warning message is displayed
   * Verifies security warning is shown to users
   */
  it("should display security warning message", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/This will change your password immediately/i)
    ).toBeInTheDocument();
  });

  /**
   * Test: Submit button exists and is enabled by default
   * Verifies submit button is present and clickable
   */
  it("should have an enabled submit button", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByRole("button", {
      name: /Change Password/i,
    });

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  /**
   * Test: Password inputs have correct type
   * Verifies inputs are type="password" for security
   */
  it("should have password type inputs for security", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const newPasswordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText(
      "Confirm new password"
    );

    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  /**
   * Test: Modal has proper ARIA labels
   * Verifies accessibility attributes are present
   */
  it("should have proper accessibility attributes", () => {
    render(<ChangePasswordModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText("Close modal");
    expect(closeButton).toBeInTheDocument();
  });
});

// Exported test suite ensures ChangePasswordModal renders and behaves correctly
// Focuses on UI interactions and basic functionality without complex form mocking
