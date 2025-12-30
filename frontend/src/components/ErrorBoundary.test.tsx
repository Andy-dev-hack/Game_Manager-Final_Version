/**
 * @file ErrorBoundary.test.tsx
 * @description Integration tests for ErrorBoundary verifying error catching and fallback UI rendering.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

// Component that throws an error
const ThrowError = () => {
  throw new Error("Test Error");
};

describe("ErrorBoundary", () => {
  // Suppress console.error during these tests to keep output clean
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe Content")).toBeInTheDocument();
  });

  it("should render fallback UI when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
  });
});
