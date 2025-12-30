/**
 * @file express.d.ts
 * @description Type definitions for Express Request extensions.
 * Adds userData property to Request for JWT payload.
 */
import { JwtPayload } from "../middleware/auth.middleware";

declare module "express-serve-static-core" {
  interface Request {
    userData?: JwtPayload;
  }
}
