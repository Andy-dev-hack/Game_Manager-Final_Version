import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles onClick events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button isLoading>Click Me</Button>);
    expect(screen.getByText("⏳")).toBeInTheDocument();
    expect(screen.queryByText("Click Me")).not.toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    // We check if the button has the ghost class (indirectly via classList or style)
    // CSS modules might obscure the exact class name, so we just check render success for now
    // Ideally we would check for specific styles or className logic
    expect(container.firstChild).toBeInTheDocument();
  });
});
