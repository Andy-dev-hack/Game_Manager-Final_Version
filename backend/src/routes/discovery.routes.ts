/**
 * @file discovery.routes.ts
 * @description Routes for the Unified Search (Discovery) module.
 */
import { Router } from "express";
import { search } from "../controllers/discovery.controller";

const router = Router();

/**
 * @swagger
 * /api/discovery:
 *   get:
 *     summary: Search games across Local and External (RAWG) catalogs
 *     description: |
 *       Performs a unified search.
 *       1. Searches local database for matches in title, genre, developer, platform.
 *       2. Searches external RAWG API.
 *       3. Seamlessly imports new matches from RAWG to local DB (Eager Sync).
 *       4. Returns unified list of results.
 *     tags: [Discovery]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (min 2 chars)
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
 *         name: developer
 *         schema:
 *           type: string
 *         description: Filter by developer
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DiscoveryGame'
 *                 source:
 *                   type: string
 *                   enum: [local, mixed]
 *                   description: Source of the results
 *       500:
 *         description: Server error
 */
router.get("/", search);

export default router;
