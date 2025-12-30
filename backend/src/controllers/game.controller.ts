/**
 * @file game.controller.ts
 * @description Handles HTTP requests for the global game catalog.
 * Supports creating, searching, updating, and deleting games.
 */
import { Request, Response } from "express";
import {
  createCatalogGame,
  searchGames,
  getCatalogGameById,
  deleteCatalogGame,
  updateCatalogGame,
  getFilters,
} from "../services/game.service";
import { searchGames as searchRAWG } from "../services/rawg.service";
import { getCompleteGameData } from "../services/game-aggregator.service";
import { CreateGameDto, UpdateGameDto } from "../dtos/game.dto";
import { asyncHandler } from "../utils/asyncHandler";

// Create game in catalog
// Destination: Used in src/routes/game.routes.ts (POST /).
// Endpoint: POST /api/games
// Handles file upload for game cover image.
export const create = asyncHandler(async (req: Request, res: Response) => {
  // Note: We could restrict this to admins, but leaving open for now
  const gameData: CreateGameDto = req.body;

  // If a file was uploaded, use its local path
  if (req.file) {
    gameData.image = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }
  // If no file, gameData.image will be used if provided in body (external URL)

  const game = await createCatalogGame(gameData);
  res.status(201).json({ message: "Game added to catalog", game });
});

// Search games
// Destination: Used in src/routes/game.routes.ts (GET /).
// Endpoint: GET /api/games
// Parses query parameters for filtering and pagination.
export const search = asyncHandler(async (req: Request, res: Response) => {
  const {
    query,
    page,
    limit,
    genre,
    platform,
    sortBy,
    order,
    onSale,
    maxPrice,
    developer,
    publisher,
  } = req.query;

  // Validation is handled by Zod middleware
  const pageNum = page ? parseInt(page as string) : 1;
  const limitNum = limit ? parseInt(limit as string) : 10;
  const isOnSale = onSale === "true";
  const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

  const result = await searchGames(
    (query as string) || "",
    pageNum,
    limitNum,
    genre as string,
    platform as string,
    sortBy as string,
    order as "asc" | "desc",
    isOnSale ? true : undefined,
    maxPriceNum,
    developer as string,
    publisher as string
  );
  res.json(result);
});

// Get filters (Genres & Platforms)
// Destination: Used in src/routes/game.routes.ts (GET /filters).
// Endpoint: GET /api/games/filters
export const getFiltersEndpoint = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = await getFilters();
    res.json(filters);
  }
);

// Get a game
// Destination: Used in src/routes/game.routes.ts (GET /:id).
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const game = await getCatalogGameById(id);
  res.json(game);
});

// Delete game (Admin)
// Destination: Used in src/routes/game.routes.ts (DELETE /:id).
export const deleteGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteCatalogGame(id);
  res.json({ message: "Game deleted from catalog" });
});

// Update game (Admin)
// Destination: Used in src/routes/game.routes.ts (PUT /:id).
export const updateGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gameData: UpdateGameDto = req.body;

  // Si se subió un archivo, usar su ruta local
  if (req.file) {
    gameData.image = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  const updatedGame = await updateCatalogGame(id, gameData);
  res.json({ message: "Game updated", game: updatedGame });
});

// Search games in RAWG (External)
// Destination: Used in src/routes/game.routes.ts (GET /search).
// Endpoint: GET /api/games/search
export const searchExternal = asyncHandler(
  async (req: Request, res: Response) => {
    const { q } = req.query;
    // Validation handled by middleware
    const results = await searchRAWG(q as string);
    res.json({ results });
  }
);

// Create game from RAWG data
// Destination: Used in src/routes/game.routes.ts (POST /from-rawg).
// Endpoint: POST /api/games/from-rawg
export const createFromRAWG = asyncHandler(
  async (req: Request, res: Response) => {
    const { rawgId, steamAppId } = req.body;

    // 1. Get complete data from RAWG + Steam
    const gameData = await getCompleteGameData(rawgId, steamAppId);

    // 2. Create game in catalog
    const game = await createCatalogGame(gameData);

    res.status(201).json({ message: "Juego añadido desde RAWG", game });
  }
);
