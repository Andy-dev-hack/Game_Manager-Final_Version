/**
 * @file role.middleware.ts
 * @description Middleware for role-based access control.
 * Verifies that the authenticated user has admin privileges.
 */
import { Request, Response, NextFunction } from "express";

import { UserRole } from "../types/enums";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userData && req.userData.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied: Administrator privileges required",
    });
  }
};
