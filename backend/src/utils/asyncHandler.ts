/**
 * @file asyncHandler.ts
 * @description Wrapper for async route handlers.
 * Automatically catches errors and passes them to the error middleware.
 */
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
