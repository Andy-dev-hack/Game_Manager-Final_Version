/**
 * @file password.util.ts
 * @description Utility functions for password hashing and comparison.
 * Uses bcrypt for secure password handling.
 */
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../config/env";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
