/**
 * @file swagger.ts
 * @description Configures Swagger/OpenAPI documentation for the API.
 * Defines API metadata, security schemes, and reusable schemas.
 */
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js JWT Authentication API",
      version: "1.0.0",
      description:
        "API documentation for the Node.js JWT Authentication project",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3500",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Error description" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "admin"] },
            image: { type: "string" },
          },
        },
        Game: {
          type: "object",
          properties: {
            _id: { type: "string", format: "uuid" },
            title: { type: "string" },
            genre: { type: "string" },
            platform: { type: "string" },
            developer: { type: "string" },
            publisher: { type: "string" },
            image: { type: "string" },
            score: { type: "number" },
            price: { type: "number" },
            currency: { type: "string" },
          },
        },
        UserGame: {
          type: "object",
          properties: {
            game: { $ref: "#/components/schemas/Game" },
            status: {
              type: "string",
              enum: [
                "playing",
                "completed",
                "dropped",
                "plan_to_play",
                "pending",
              ],
            },
            hoursPlayed: { type: "number" },
            score: { type: "number" },
            review: { type: "string" },
            isFavorite: { type: "boolean" },
            isOwned: { type: "boolean" },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", format: "uuid" },
            totalAmount: { type: "number" },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  game: { type: "string" },
                  title: { type: "string" },
                  price: { type: "number" },
                  licenseKey: { type: "string" },
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer" },
            pages: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs (updated to .ts)
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
