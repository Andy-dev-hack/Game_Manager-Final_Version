/**
 * error.util.ts
 * Centralized error handling utilities
 * Provides consistent error logging and user-facing error messages
 */

import toast from "react-hot-toast";
import { isApiError } from "../types/api.types";

/**
 * Logger utility for development and production
 * In development: logs to console
 * In production: can be extended to send to error tracking service
 */
export const logger = {
  /**
   * Log error messages
   * @param message - Error message
   * @param error - Optional error object
   */
  error: (message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      console.error(message, error);
    }
    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
  },

  /**
   * Log warning messages
   * @param message - Warning message
   * @param data - Optional data object
   */
  warn: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(message, data);
    }
  },

  /**
   * Log info messages
   * @param message - Info message
   * @param data - Optional data object
   */
  info: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.info(message, data);
    }
  },
};

/**
 * Extract error message from various error types
 * @param error - Unknown error object
 * @param fallback - Fallback message if error cannot be parsed
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred"
): string {
  // Check if it's an API error with response data
  if (isApiError(error)) {
    return error.response.data.message;
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Check if it's a string
  if (typeof error === "string") {
    return error;
  }

  // Return fallback for unknown error types
  return fallback;
}

/**
 * Handle API errors with toast notifications and logging
 * @param error - Error object from API call
 * @param fallbackMessage - Optional custom fallback message
 */
export function handleApiError(error: unknown, fallbackMessage?: string): void {
  const message = getErrorMessage(error, fallbackMessage);
  toast.error(message);
  logger.error("API Error:", error);
}

/**
 * Wrapper for async operations with automatic error handling
 * @param operation - Async operation to execute
 * @param errorMessage - Optional custom error message
 * @returns Result of operation or null if error occurred
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
}

// Exported to all components and services for consistent error handling
