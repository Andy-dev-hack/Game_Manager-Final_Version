/**
 * @file game.routes.ts
 * @description Defines routes for the global game catalog.
 * Includes Swagger documentation for each endpoint.
 */
import express from "express";
import {
  create,
  search,
  getOne,
  deleteGame,
  updateGame,
  searchExternal,
  createFromRAWG,
} from "../controllers/game.controller";
import checkAuth from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/role.middleware";
import {
  createGameSchema,
  updateGameSchema,
  searchGameSchema,
  searchExternalSchema,
  createFromRAWGSchema,
} from "../validators/zod/game.schema";
import { validateZod } from "../middleware/zod.middleware";
import upload from "../middleware/upload.middleware";

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Search games in catalog
 *     tags: [Games]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *     security:
 *       - bearerAuth: []
 */
router.get("/", validateZod(searchGameSchema, "query"), search);

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Add a game to the global catalog
 *     tags: [Games]

 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - genre
 *               - platform
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               platform:
 *                 type: string
 *               developer:
 *                 type: string
 *               publisher:
 *                 type: string
 *               score:
 *                 type: number
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
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
 */
router.post(
  "/",
  checkAuth,
  isAdmin,
  upload.single("image"),
  validateZod(createGameSchema),
  create
);

/**
 * @swagger
 * /api/games/search:
 *   get:
 *     summary: Search games in RAWG database (External)
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of games from RAWG
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/search",
  checkAuth,
  validateZod(searchExternalSchema, "query"),
  searchExternal
);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Get game details
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", getOne);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Delete a game from the catalog (Admin only) - Cascade deletes from all User collections
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game deleted
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", isAdmin, deleteGame);

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Update a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The game ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               platform:
 *                 type: string
 *               developer:
 *                 type: string
 *               publisher:
 *                 type: string
 *               score:
 *                 type: number
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Game updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
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
 */
router.put(
  "/:id",
  checkAuth,
  isAdmin,
  upload.single("image"),
  validateZod(updateGameSchema),
  updateGame
);

/**
 * @swagger
 * /api/games/from-rawg:
 *   post:
 *     summary: Create a game from RAWG data
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rawgId
 *             properties:
 *               rawgId:
 *                 type: integer
 *               steamAppId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
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
 */
router.post(
  "/from-rawg",
  checkAuth,
  isAdmin,
  validateZod(createFromRAWGSchema),
  createFromRAWG
);

export default router;
