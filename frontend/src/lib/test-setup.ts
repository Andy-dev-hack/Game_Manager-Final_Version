/**
 * test-setup.ts
 * Global test configuration for Vitest + React Testing Library.
 * Configures MSW for API mocking and i18next for translation testing.
 */

import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "../mocks/server";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import es from "../locales/es.json";

/**
 * Mock localStorage for i18n language persistence and auth tokens.
 * Uses an in-memory storage object to properly simulate localStorage behavior.
 */
const storage: Record<string, string> = {};

const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => storage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  }),
  length: 0,
  key: vi.fn(() => null),
};
(globalThis as typeof globalThis & { localStorage: Storage }).localStorage =
  localStorageMock;

/**
 * Initialize i18next for tests synchronously.
 * Must be initialized before any tests run to ensure translations work.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

/**
 * Establish API mocking before all tests.
 * MSW intercepts HTTP requests and returns mock responses.
 */
beforeAll(() => server.listen());

/**
 * Reset any request handlers that we may add during the tests,
 * so they don't affect other tests.
 */
afterEach(() => server.resetHandlers());

/**
 * Clean up after the tests are finished.
 * Closes MSW server to prevent memory leaks.
 */
afterAll(() => server.close());
