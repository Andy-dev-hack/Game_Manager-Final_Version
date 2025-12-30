/**
 * @file error.middleware.ts
 * @description Global error handling middleware.
 * Catches all errors, formats them into a consistent JSON structure, and handles specific error types (AppError, Mongoose).
 */
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";
import { Error as MongooseError } from "mongoose";

/**
 * Mongoose Duplicate Key Error interface
 * Represents MongoDB duplicate key errors (code 11000)
 */
interface MongoDuplicateKeyError extends Error {
  code: number;
  errmsg: string;
  keyValue?: Record<string, unknown>;
}

/**
 * Generic error with optional statusCode
 */
interface ErrorWithStatus extends Error {
  statusCode?: number;
}

/**
 * Union type for all possible error types
 */
type ErrorType =
  | AppError
  | MongooseError.CastError
  | MongooseError.ValidationError
  | MongoDuplicateKeyError
  | ErrorWithStatus
  | Error;

// Global Error Handler
// Destination: Used in src/server.ts as the last middleware.
// Must be the last middleware used in app.ts.
// Differentiates between operational errors (AppError) and programming errors.
export const errorHandler = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If development, log the full error
  if (process.env.NODE_ENV === "development") {
    logger.error(err);
  }

  // If it's a known operational error (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // If it's a Mongoose CastError
  if (err.name === "CastError" && "path" in err && "value" in err) {
    const castError = err as MongooseError.CastError;
    return res.status(400).json({
      status: "fail",
      message: `Invalid ${castError.path}: ${castError.value}`,
    });
  }

  // If it's a Mongoose ValidationError
  if (
    err.name === "ValidationError" &&
    err instanceof MongooseError.ValidationError
  ) {
    const messages = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({
      status: "fail",
      message: messages.join(". "),
    });
  }

  // If it's a MongoDB duplicate key error
  if ("code" in err && err.code === 11000) {
    const duplicateError = err as MongoDuplicateKeyError;
    const value =
      duplicateError.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "unknown";
    return res.status(400).json({
      status: "fail",
      message: `Duplicate field value: ${value}. Please use another value!`,
    });
  }

  // Generic Error (500)
  const statusCode =
    "statusCode" in err && typeof err.statusCode === "number"
      ? err.statusCode
      : 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
};
