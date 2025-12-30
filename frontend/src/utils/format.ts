/**
 * format.ts
 * Utility functions for formatting data for display.
 * Provides currency formatting using Intl.NumberFormat API.
 */

/**
 * Format number as currency
 * Uses Intl.NumberFormat for locale-aware currency formatting
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., "USD", "EUR")
 * @returns {string} Formatted currency string (e.g., "$19.99")
 */
export const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Exported to GameCard and other components for price display

/**
 * Format platform name to abbreviated version
 * @param {string} platform - Original platform name
 * @returns {string} Abbreviated platform name
 */
export const formatPlatformName = (platform: string): string => {
  const mappings: Record<string, string> = {
    "PlayStation 1": "PS1",
    "PlayStation 2": "PS2",
    "PlayStation 3": "PS3",
    "PlayStation 4": "PS4",
    "PlayStation 5": "PS5",
    "Nintendo Switch": "Switch",
    "Nintendo 3DS": "3DS",
    "Xbox Series S/X": "Xbox S/X",
  };

  return mappings[platform] || platform;
};
