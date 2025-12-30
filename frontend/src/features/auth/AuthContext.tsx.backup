/**
 * AuthContext.tsx
 * Authentication context provider using React Context API.
 * Manages global authentication state including user data, login/logout operations,
 * and session restoration from localStorage tokens.
 *
 * Pattern: Context API for global auth state (appropriate for app-wide user data)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, LoginCredentials, RegisterCredentials } from "./types";
import { authService } from "../../services/auth.service";
import { authEvents, AUTH_LOGOUT } from "../../utils/auth-events";

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
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Wraps the application to provide authentication state and operations.
 * Automatically restores user session on mount if valid token exists.
 *
 * @param {ReactNode} children - Child components to wrap
 * @returns {JSX.Element} Context provider with auth state
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Lazy initialization from localStorage to prevent flickering
  const [user, setUser] = useState<User | null>(() =>
    authService.getStoredUser()
  );

  // Loading state starts false if we have a user (optimistic), true otherwise
  const [isLoading, setIsLoading] = useState<boolean>(
    !authService.getStoredUser()
  );

  /**
   * Initialize authentication state on component mount
   * Verify session with backend even if we have stored data
   */
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Re-validate with backend (Stale-While-Revalidate pattern)
          const userData = await authService.getProfile();
          setUser(userData); // Updates with fresh data from server
        } catch (error) {
          console.error("Failed to restore session:", error);
          // Only logout if it's a critical auth error, otherwise keep offline state
          // For now, we trust access token validation in interceptors
          // authService.logout();
        }
      } else {
        // No token, ensure no user
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();

    // Subscribe to soft logout events (from API client)
    const unsubscribe = authEvents.on(AUTH_LOGOUT, () => {
      logout();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Login user with credentials
   * Calls auth service, stores token, and updates user state
   * @param {LoginCredentials} credentials - User email and password
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user); // Token stored by authService
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user account
   * Creates account, logs in automatically, and updates user state
   * @param {RegisterCredentials} credentials - User registration data
   */
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user); // Auto-login after registration
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears token from localStorage and resets user state
   */
  const logout = () => {
    authService.logout(); // Removes token from localStorage
    setUser(null);
  };

  /**
   * Refresh user data from server
   * Useful after profile updates (e.g., avatar change)
   * Does not update loading state to avoid UI flicker
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

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
