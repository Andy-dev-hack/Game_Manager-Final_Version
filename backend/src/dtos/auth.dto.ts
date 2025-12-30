/**
 * @file auth.dto.ts
 * @description Data Transfer Objects for authentication operations.
 * Defines interfaces for registration, login, and user updates.
 */
export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  // image is handled by multer, so it's not strictly part of the JSON body here,
  // but we can include it if we want to type the full expected data object after processing
}
