/**
 * @file stats.routes.ts
 * @description Routes definition for public statistics endpoints.
 */
import express from "express";
import { getStats, getDashboardStats } from "../controllers/stats.controller";
import checkAuth from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Get global site statistics
 *     description: Returns counts of total users, games, and collections (UserGames).
 *     tags: [Public Stats]
 *     responses:
 *       200:
 *         description: Global statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 1250
 *                 totalGames:
 *                   type: integer
 *                   example: 15400
 *                 totalCollections:
 *                   type: integer
 *                   example: 45000
 *       500:
 *         description: Server error
 */
router.get("/public", getStats);

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Admin access required
 */
router.get("/dashboard", checkAuth, isAdmin, getDashboardStats);

export default router;
