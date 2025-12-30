/**
 * @file stats.controller.ts
 * @description Controller for handling statistics-related HTTP requests.
 * Delegates business logic to StatsService and writes responses.
 */
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getGlobalStats,
  getDashboardStatsService,
} from "../services/stats.service";
import { StatsResponseDto } from "../dtos/stats.dto";

/**
 * getStats
 * Retrieves global statistics for the home page.
 *
 * @route GET /api/public/stats
 * @access Public
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats: StatsResponseDto = await getGlobalStats();
  res.status(200).json(stats);
});

/**
 * getDashboardStats
 * Retrieves detailed statistics for the admin dashboard.
 *
 * @route GET /api/stats/dashboard
 * @access Private (Admin)
 */
export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  }
);
