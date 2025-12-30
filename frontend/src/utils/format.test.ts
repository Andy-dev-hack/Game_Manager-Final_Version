import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(19.99, "USD")).toBe("$19.99");
  });

  it("formats EUR correctly", () => {
    // Note: Depends on locale, but usually creates €19.99 or 19,99 €
    // We check if it contains the symbol and value
    const result = formatCurrency(19.99, "EUR");
    expect(result).toContain("€");
    expect(result).toContain("19.99");
  });

  it("handles zero correctly", () => {
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});
