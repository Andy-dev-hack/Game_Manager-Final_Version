/**
 * AuthContext.tsx
 * Authentication context provider using React Context API.
 * Manages global authentication state including user data, login/logout operations,
 * and session restoration from localStorage tokens.
 *
 * Pattern: Context API for global auth state (appropriate for app-wide user data)
 */

import { createContext, useContext } from "react";
import type { User, LoginCredentials, RegisterCredentials } from "./types";

/**
 * Authentication context type definition
 * Provides user state and authentication operations to consuming components
 */
interface AuthContextType {
  user: User | null; // Current authenticated user or null if not logged in
  isLoading: boolean; // Loading state for async auth operations
  login: (credentials: LoginCredentials) => Promise<void>; // Login function
  register: (credentials: RegisterCredentials) => Promise<void>; // Registration function
  logout: () => void; // Logout function (synchronous)
  refreshUser: () => Promise<void>; // Refresh user data from server
  isAuthenticated: boolean; // Computed boolean for auth status
}

// Create context with undefined default (requires provider)
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * useAuth hook
 * Custom hook to access authentication context.
 * Must be used within AuthProvider component tree.
 *
 * @returns {AuthContextType} Authentication state and operations
 * @throws {Error} If used outside AuthProvider
 *
 * Usage example:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
