/**
 * @file discovery.controller.ts
 * @description Controller for the Discovery endpoints.
 * Handles HTTP requests for Unified Search.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { searchAndSync } from "../services/discovery.service";

/**
 * Search games in both Local and Remote catalogs.
 * Destination: Used by /api/discovery?q={query}
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, genre, platform, developer } = req.query as any;

  // Enforce minimum query length to avoid spamming RAWG with single characters
  if (!q || typeof q !== "string" || q.length < 2) {
    res.json({ results: [], source: "local" });
    return;
  }

  const filters = {
    genre: typeof genre === "string" ? genre : undefined,
    platform: typeof platform === "string" ? platform : undefined,
    developer: typeof developer === "string" ? developer : undefined,
  };

  const result = await searchAndSync(q, filters);
  res.json(result);
});
