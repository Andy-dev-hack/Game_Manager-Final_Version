/**
 * @file auth.controller.ts
 * @description Handles incoming HTTP requests for authentication and user management.
 * Delegates business logic to AuthService and sends formatted JSON responses.
 */
import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserById,
  refreshTokenService,
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/auth.service";
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from "../dtos";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// Registration
// Destination: Used in src/routes/user.routes.ts (POST /register).
// Endpoint: POST /api/users/register
// Public access. Creates a new user.
export const register = asyncHandler(async (req: Request, res: Response) => {
  const userData: RegisterUserDto = req.body;
  const user = await registerUser(userData);
  res.status(201).json({ message: "User registered successfully", user });
});

// Login
// Destination: Used in src/routes/user.routes.ts (POST /login).
// Endpoint: POST /api/users/login
// Public access. Authenticates user and returns tokens.
export const login = asyncHandler(async (req: Request, res: Response) => {
  const loginData: LoginUserDto = req.body;
  const ipAddress = req.ip;
  const { token, refreshToken, user } = await loginUser(
    loginData.email,
    loginData.password,
    ipAddress
  );
  res.status(200).json({ message: "Login exitoso", token, refreshToken, user });
});

// Refresh Token
// Destination: Used in src/routes/user.routes.ts (POST /refresh-token).
// Endpoint: POST /api/users/refresh-token
// Public access. Rotates refresh tokens to issue new access tokens.
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;
    const ipAddress = req.ip;
    const {
      token: newToken,
      refreshToken: newRefreshToken,
      user,
    } = await refreshTokenService(token, ipAddress);
    res.status(200).json({
      message: "Token refreshed successfully",
      token: newToken,
      refreshToken: newRefreshToken,
      user,
    });
  }
);

// Update User
// Destination: Used in src/routes/user.routes.ts (PUT /update).
// Endpoint: PUT /api/users/update
// Protected access. Updates profile data and handles profile picture upload.
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;
  if (!userId) throw new Error("User ID not found in token");

  const updateData: UpdateUserDto = req.body;
  const imagePath = req.file ? req.file.path : undefined;

  const updatedUser = await updateUserProfile(userId, updateData, imagePath);
  res.json({ message: "User updated", user: updatedUser });
});

// Delete User (Admin)
// Destination: Used in src/routes/user.routes.ts (DELETE /:id).
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteUserById(id);
  res.json({ message: "User deleted successfully" });
});

// Get Profile
// Destination: Used in src/routes/user.routes.ts (GET /profile).
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userData?.id;
  if (!userId) throw new AppError("User ID not found in token", 401);

  const user = await getUserById(userId);
  res.status(200).json({ message: "Profile data", user });
});

// Get All Users (Admin)
// Destination: Used in src/routes/user.routes.ts (GET /).
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const query = (req.query.query as string) || "";

  const result = await getAllUsersService(page, limit, query);
  res.status(200).json(result);
});

// Change Role (Admin)
// Destination: Used in src/routes/user.routes.ts (PUT /:id/role).
export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    throw new AppError("Invalid role. Must be 'user' or 'admin'", 400);
  }

  const updatedUser = await updateUserRoleService(id, role);
  res
    .status(200)
    .json({ message: "Role updated successfully", user: updatedUser });
});
