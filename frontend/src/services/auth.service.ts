/**
 * auth.service.ts
 * Authentication service handling user login, registration, and profile management.
 * Manages JWT token storage in localStorage and communicates with backend auth endpoints.
 * All methods use the configured apiClient for HTTP requests.
 */

import apiClient from "./api.client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../features/auth/types";

/**
 * Authentication service
 * Provides methods for user authentication and profile management
 */
// Key for storing user data in localStorage
const USER_STORAGE_KEY = "game_manager_user";

/**
 * Interface for user data from backend API
 */
interface UserApiData {
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  profilePicture?: string;
  createdAt?: string;
}

/**
 * Helper to transform backend user data to frontend User interface
 * - Maps profilePicture -> avatar
 * - Ensures avatar path is absolute (starts with /) for proxy
 */
const transformUser = (userData: UserApiData): User => {
  if (!userData) return userData as User;

  // Handle profilePicture vs avatar mismatch
  let avatar = userData.avatar;
  if (userData.profilePicture) {
    // Ensure path starts with / for relative paths to work with proxy
    avatar =
      userData.profilePicture.startsWith("http") ||
      userData.profilePicture.startsWith("/")
        ? userData.profilePicture
        : `/${userData.profilePicture}`;
  }

  return {
    ...userData,
    avatar,
  } as User;
};

export const authService = {
  /**
   * Login user with credentials
   * by sending credentials to backend and storing JWT token on success
   * @param {LoginCredentials} credentials - User email and password
   * @returns {Promise<AuthResponse>} Auth response with user data and token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/users/login",
      credentials
    );
    if (data.token) {
      const user = transformUser(data.user);
      localStorage.setItem("token", data.token); // Store JWT for future requests
      localStorage.setItem("refreshToken", data.refreshToken); // Store refresh token
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); // Store user data
      return { ...data, user };
    }
    return { ...data, user: transformUser(data.user) };
  },

  /**
   * Register new user account
   * Creates new account and automatically logs in user on success
   * @param {RegisterCredentials} credentials - User registration data
   * @returns {Promise<AuthResponse>} Auth response with user data and token
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/users/register",
      credentials
    );
    if (data.token) {
      const user = transformUser(data.user);
      localStorage.setItem("token", data.token); // Auto-login after registration
      localStorage.setItem("refreshToken", data.refreshToken); // Store refresh token
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); // Store user data
      return { ...data, user };
    }
    return { ...data, user: transformUser(data.user) };
  },

  /**
   * Logout current user
   * Removes JWT token, refresh token, and user data from localStorage
   */
  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  /**
   * Get current user profile
   * Fetches authenticated user data from backend
   * @returns {Promise<User>} Current user profile data
   */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<{ message: string; user: User }>(
      "/users/profile"
    );
    const user = transformUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); // Update stored user
    return user;
  },

  /**
   * Update user profile
   * Uploads profile data including avatar image using multipart/form-data
   * @param {FormData} formData - Form data with profile fields and optional avatar file
   * @returns {Promise<User>} Updated user profile data
   */
  async updateProfile(formData: FormData): Promise<User> {
    const { data } = await apiClient.put<{ message: string; user: User }>(
      "/users/update",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Required for file upload
        },
      }
    );
    const user = transformUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); // Update stored user
    return user;
  },

  /**
   * Refresh access token using refresh token
   * Calls backend refresh endpoint to get new token pair
   * @returns {Promise<AuthResponse>} New tokens and user data
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const { data } = await apiClient.post<AuthResponse>(
      "/users/refresh-token",
      { token: refreshToken }
    );

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      // Note: Refresh token endpoint might not return the full user object depending on backend implementation.
      // If it does, we should update it. If not, we keep the existing one.
      if (data.user) {
        const user = transformUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return { ...data, user };
      }
    }

    return data;
  },

  /**
   * Check if user is authenticated
   * Checks for presence of JWT token in localStorage
   * @returns {boolean} True if token exists, false otherwise
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },

  /**
   * Get stored user from localStorage
   * Used for initializing auth state without waiting for network
   * @returns {User | null} Stored user or null
   */
  getStoredUser(): User | null {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser);
      // Safety check: if we accidentally stored the wrapper, try to recover or fail
      if (parsed && parsed.user && !parsed.username) {
        return parsed.user;
      }
      return parsed;
    } catch {
      return null;
    }
  },
};

// Exported to AuthContext and other components for authentication operations
