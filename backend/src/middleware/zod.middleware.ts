/**
 * @file zod.middleware.ts
 * @description Middleware adapter to validate requests using Zod schemas.
 * Acts as a bridge between Express and Zod, formatting errors to match existing frontend expectations.
 * Destination: used in routes to replace express-validator arrays.
 */
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateZod =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Select data source based on argument
      const dataToValidate = req[source];

      // Parse request data against schema
      await schema.parseAsync(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to the format expected by our frontend
        const formattedErrors = error.issues.map((issue) => ({
          msg: issue.message,
          path: issue.path.join("."),
          location: source, // Correctly report location
        }));

        return res.status(400).json({ errors: formattedErrors });
      }
      // Pass other errors to global error handler
      next(error);
    }
  };
