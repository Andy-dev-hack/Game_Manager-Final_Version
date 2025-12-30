/**
 * @file stats.service.ts
 * @description Service for calculating global and dashboard statistics.
 * Aggregates data from Users, Games, and Orders collections.
 */
import UserGame from "../models/userGame.model";
import User from "../models/user.model";
import Game from "../models/game.model";
import Order from "../models/order.model";
import { StatsResponseDto } from "../dtos/stats.dto";
import logger from "../utils/logger";

/**
 * Public global stats (existing)
 */
export const getGlobalStats = async (): Promise<StatsResponseDto> => {
  logger.info("StatsService: Fetching global statistics");

  const [totalUsers, totalGames, totalCollections] = await Promise.all([
    User.countDocuments(),
    Game.countDocuments(),
    UserGame.countDocuments({ isOwned: true }),
  ]);

  logger.info(
    `StatsService: Stats fetched - Users: ${totalUsers}, Games: ${totalGames}, Collections: ${totalCollections}`
  );

  return {
    totalUsers,
    totalGames,
    totalCollections,
  };
};

/**
 * Admin Dashboard Stats (Deep Analysis)
 */
export const getDashboardStatsService = async () => {
  // 1. General KPIs
  const totalUsers = await User.countDocuments();
  const totalGames = await Game.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Aggregate Revenue (Sum of 'totalAmount' in COMPLETED orders)
  const revenueAgg = await Order.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;
  const completedOrdersCount = revenueAgg[0]?.count || 0;
  const averageOrderValue =
    completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

  // 2. Top 5 Best Selling Games (by Revenue)
  // We need to unwind items, then group by game title/id
  const topSellingGames = await Order.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.title", // Group by Title (Snapshot)
        gameId: { $first: "$items.game" },
        revenue: { $sum: "$items.price" },
        unitPrice: { $first: "$items.price" }, // Get one instance of price
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // 3. Platform Distribution
  // Games have a "platforms" array of strings
  const platformDistribution = await Game.aggregate([
    { $unwind: "$platforms" },
    {
      $group: {
        _id: "$platforms",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // 4. Sales Trend (Last 12 Months)
  const salesTrend = await Order.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // 5. Most Popular in Libraries (Owned)
  // We need to lookup the game title since UserGame only has game ID
  const libraryStats = await UserGame.aggregate([
    { $match: { isOwned: true } },
    {
      $group: {
        _id: "$game",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "games",
        localField: "_id",
        foreignField: "_id",
        as: "gameDetails",
      },
    },
    { $unwind: "$gameDetails" },
    {
      $project: {
        title: "$gameDetails.title",
        count: 1,
      },
    },
  ]);

  // 6. Genre Distribution (Catalog)
  const genreDistribution = await Game.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Define Aggregation Result Interfaces to avoid 'any'
  interface TopSellingAgg {
    _id: string; // Game Title
    gameId: string;
    revenue: number;
    unitPrice: number;
    salesCount: number;
  }

  interface SalesTrendAgg {
    _id: { year: number; month: number };
    totalSales: number;
    orderCount: number;
  }

  interface DistributionAgg {
    _id: string;
    count: number;
  }

  interface LibraryStatsAgg {
    title: string;
    count: number;
  }

  return {
    revenue: totalRevenue,
    averageOrderValue,
    topSelling: topSellingGames.map((g: unknown) => {
      const game = g as TopSellingAgg;
      return {
        _id: game.gameId,
        title: game._id,
        totalSold: game.salesCount,
        revenue: game.revenue,
        unitPrice: game.unitPrice,
      };
    }),
    monthlyTrends: salesTrend.map((t: unknown) => {
      const trend = t as SalesTrendAgg;
      return {
        _id: `${trend._id.year}-${String(trend._id.month).padStart(2, "0")}`,
        sales: trend.totalSales,
        revenue: trend.totalSales,
        orders: trend.orderCount,
      };
    }),
    platforms: platformDistribution.map((p: unknown) => {
      const platform = p as DistributionAgg;
      return {
        name: platform._id,
        count: platform.count,
      };
    }),
    genres: genreDistribution.map((g: unknown) => {
      const genre = g as DistributionAgg;
      return {
        name: genre._id,
        count: genre.count,
      };
    }),
    libraryStats: libraryStats.map((l: unknown) => {
      const lib = l as LibraryStatsAgg;
      return {
        title: lib.title,
        count: lib.count,
      };
    }),
  };
};
