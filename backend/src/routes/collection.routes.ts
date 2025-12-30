/**
 * @file collection.routes.ts
 * @description Defines routes for user's personal game collection.
 * Includes Swagger documentation for each endpoint.
 */
import express from "express";
import {
  addToCollection,
  getCollection,
  updateItem,
  removeItem,
} from "../controllers/collection.controller";
import checkAuth from "../middleware/auth.middleware";
import {
  addToCollectionSchema,
  updateCollectionItemSchema,
} from "../validators/zod/collection.schema";
import { validateZod } from "../middleware/zod.middleware";

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 * /api/collection:
 *   get:
 *     summary: Get my game collection
 *     tags: [Collection]
 *     parameters:
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
 *           default: 12
 *         description: Items per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by game title
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (playing, completed, dropped, plan_to_play, pending)
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
 *           default: createdAt
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
 *         description: Paginated list of user games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserGame'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
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
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getCollection);

/**
 * @swagger
 * /api/collection:
 *   post:
 *     summary: Add a game to my collection
 *     tags: [Collection]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId]
 *             properties:
 *               gameId: { type: string }
 *               status:
 *                 type: string
 *                 enum: [playing, completed, dropped, plan_to_play, pending]
 *               hoursPlayed: { type: number }
 *               score: { type: number }
 *               review: { type: string }
 *               isFavorite: { type: boolean }
 *     responses:
 *       201:
 *         description: Added to collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGame'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
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
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validateZod(addToCollectionSchema), addToCollection);

/**
 * @swagger
 * /api/collection/{id}:
 *   put:
 *     summary: Update collection item
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [playing, completed, dropped, plan_to_play, pending]
 *               hoursPlayed: { type: number }
 *               score: { type: number }
 *               review: { type: string }
 *               isFavorite: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGame'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
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
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", validateZod(updateCollectionItemSchema), updateItem);

/**
 * @swagger
 * /api/collection/{id}:
 *   delete:
 *     summary: Remove from collection
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Removed
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
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
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", checkAuth, removeItem);

export default router;
