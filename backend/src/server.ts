/**
 * server.ts
 * Main entry point of the application.
 * Configures Express server, middleware stack, routes, and error handling.
 * Initializes database connection and scheduled tasks (cron jobs).
 */
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import gameRoutes from "./routes/game.routes";
import collectionRoutes from "./routes/collection.routes";
import paymentRoutes from "./routes/payment.routes";
import orderRoutes from "./routes/order.routes";
import discoveryRoutes from "./routes/discovery.routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import { errorHandler } from "./middleware/error.middleware";
import logger from "./utils/logger";
import { initCronJobs } from "./services/cron.service";
import publicGameRoutes from "./routes/publicGame.routes";
import statsRoutes from "./routes/stats.routes";
import fs from "fs-extra";

// Load environment variables from .env file
dotenv.config();

/**
 * Ensure Uploads Directory Exists
 * Creates uploads folder for user avatars and game images if not present.
 */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/**
 * Database Connection
 * Connects to MongoDB unless running in test environment.
 * Test environment uses separate database to prevent data corruption.
 */
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

/**
 * Initialize Scheduled Tasks
 * Starts cron jobs for automated tasks (e.g., price updates from Steam API).
 * Disabled in test environment to prevent interference with tests.
 */
if (process.env.NODE_ENV !== "test") {
  initCronJobs();
}

/**
 * Express Application Setup
 */
const app = express();
const PORT = process.env.PORT || 3500;

/**
 * Security Middleware Stack
 * Applied in order to protect the application:
 * 1. Helmet: Sets security-related HTTP headers
 * 2. CORS: Enables cross-origin requests from frontend
 * 3. Morgan: Logs HTTP requests for debugging
 * 4. Rate Limiter: Prevents brute-force and DDoS attacks
 */
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 1000; // Max requests per IP per window

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

/**
 * Body Parser Middleware
 * Parses incoming JSON request bodies.
 */
app.use(express.json());

/**
 * API Routes Registration
 * All routes are mounted under /api prefix for versioning.
 * Public routes (no auth required) are under /api/public.
 * Protected routes require JWT authentication middleware.
 */
app.use("/api/public/games", publicGameRoutes); // Public catalog access
app.use("/api/stats", statsRoutes); // Stats (Public & Private)
app.use("/api/users", userRoutes); // User auth and profile management
app.use("/api/games", gameRoutes); // Admin game management
app.use("/api/collection", collectionRoutes); // User library and wishlist
app.use("/api/payments", paymentRoutes); // Stripe payment processing
app.use("/api/orders", orderRoutes); // Order history
app.use("/api/discovery", discoveryRoutes); // Unified Search
app.use("/uploads", express.static("uploads")); // Static file serving
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // API documentation

/**
 * Global Error Handler
 * Must be registered last to catch errors from all routes and middleware.
 * Centralizes error responses and logging.
 */
app.use(errorHandler);

/**
 * Export App for Testing
 * Allows tests to import the app without starting the HTTP server.
 * Used by integration tests with supertest.
 */
export default app;

/**
 * Start HTTP Server
 * Only starts server when run directly (not imported by tests).
 * Logs server URL and Swagger documentation URL on startup.
 */
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info("Compression middleware enabled");
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}
