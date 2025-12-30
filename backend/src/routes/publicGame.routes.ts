/**
 * @file publicGame.routes.ts
 * @description Read-only public access to the game catalog. Mirrors the protected catalog endpoints but without auth.
 */
import express from "express";
import {
  search,
  getOne,
  getFiltersEndpoint,
} from "../controllers/game.controller";
import { searchGameSchema } from "../validators/zod/game.schema";
import { validateZod } from "../middleware/zod.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/public/games:
 *   get:
 *     summary: Public - Search games in catalog
 *     description: Read-only access to the global catalog without authentication.
 *     tags: [Public Games]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by title
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, releaseDate, title, score]
 *           default: releaseDate
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of games
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: []
 */
router.get("/filters", getFiltersEndpoint);
router.get("/", validateZod(searchGameSchema, "query"), search);

/**
 * @swagger
 * /api/public/games/{id}:
 *   get:
 *     summary: Public - Get game details
 *     description: Read-only access to game details without authentication.
 *     tags: [Public Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Game details
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: []
 */
router.get("/:id", getOne);

export default router;
