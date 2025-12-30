/**
 * @file auth.middleware.ts
 * @description Middleware to protect routes by verifying JWT tokens.
 * Extracts the token from the Authorization header and attaches user data to the request.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Authentication Middleware
// Destination: Used in routes (e.g., user.routes.ts, collection.routes.ts) to protect endpoints.
// Intercepts requests to check for a valid Bearer token.
// If valid, populates req.userData with the decoded payload.
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // El token suele venir así: "Bearer eyJhbGciOi..."
    // Usamos split para quedarnos solo con la parte del código
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Autenticación fallida: No token provided" });
    }

    // Verificamos si es válido usando nuestra clave secreta
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Si es válido, guardamos los datos del usuario en la petición (req)
    req.userData = decoded;

    // ¡Pase usted!
    next();
  } catch (error) {
    // Si falla (token expirado, falso, o no existe)
    return res.status(401).json({ message: "Autenticación fallida" });
  }
};

export default checkAuth;
