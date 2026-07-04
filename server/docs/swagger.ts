import { env } from "../config/env";

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "BookBuddy AI - Enterprise Backend API",
    description:
      "Production-ready RESTful API documentation for BookBuddy AI. Built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Redis, and AI SDKs (Gemini/Anthropic). Adheres to Clean Architecture and enterprise security standards.",
    version: "1.0.0",
    contact: {
      name: "Senior Backend Engineering Team",
      email: "engineering@bookbuddy.ai",
      url: "https://bookbuddy.ai",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `${env.appUrl}/api/v1`,
      description: "Current Environment API Server",
    },
    {
      url: "http://localhost:3000/api/v1",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your access token in the format: Bearer <token>",
      },
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "Optional API Key for machine-to-machine integrations",
      },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object", nullable: true },
        },
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Items retrieved successfully" },
          data: { type: "array", items: { type: "object" } },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              total: { type: "integer", example: 100 },
              totalPages: { type: "integer", example: 5 },
              hasNextPage: { type: "boolean", example: true },
              hasPrevPage: { type: "boolean", example: false },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message describing the failure" },
          code: { type: "string", example: "UNAUTHORIZED" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Invalid email format" },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          role: { type: "string", enum: ["USER", "MODERATOR", "ADMIN"], example: "USER" },
          avatarUrl: { type: "string", example: "/uploads/avatar.png" },
          emailVerified: { type: "boolean", example: true },
        },
      },
      Book: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Atomic Habits" },
          author: { type: "object", properties: { name: { type: "string", example: "James Clear" } } },
          description: { type: "string" },
          difficulty: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
          averageRating: { type: "number", example: 4.8 },
          pageCount: { type: "integer", example: 320 },
          coverUrl: { type: "string" },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["System & Health"],
        summary: "Check system health and diagnostics",
        security: [],
        responses: {
          200: {
            description: "System is healthy",
            content: { "application/json": { schema: { $ref: "#/components/schemas/StandardResponse" } } },
          },
        },
      },
    },
    "/metrics": {
      get: {
        tags: ["System & Health"],
        summary: "Retrieve application performance and runtime metrics",
        security: [],
        responses: { 200: { description: "Metrics returned" } },
      },
    },
    "/version": {
      get: {
        tags: ["System & Health"],
        summary: "Retrieve API version and build metadata",
        security: [],
        responses: { 200: { description: "Version metadata returned" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user account",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Jane Doe" },
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  password: { type: "string", format: "password", example: "Secret123!" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created successfully" },
          409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          422: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate user and receive JWT access & refresh tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "jane@example.com" },
                  password: { type: "string", format: "password", example: "Secret123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token using refresh token cookie or body parameter",
        security: [],
        responses: { 200: { description: "New access token issued" }, 401: { description: "Invalid refresh token" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Revoke refresh token and clear cookies",
        responses: { 200: { description: "Logged out successfully" } },
      },
    },
    "/books": {
      get: {
        tags: ["Books"],
        summary: "List books with pagination, search, sorting, and filtering",
        security: [],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Title search" },
          { name: "genre", in: "query", schema: { type: "string" } },
          { name: "difficulty", in: "query", schema: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["rating", "newest", "title"], default: "rating" } },
        ],
        responses: {
          200: { description: "Paginated books list", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedResponse" } } } },
        },
      },
      post: {
        tags: ["Books"],
        summary: "Create a new book (Admin/Moderator only)",
        responses: { 201: { description: "Book created" }, 403: { description: "Forbidden" } },
      },
    },
    "/books/{id}": {
      get: {
        tags: ["Books"],
        summary: "Get book details by ID",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Book found" }, 404: { description: "Book not found" } },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get authenticated user profile",
        responses: { 200: { description: "Profile retrieved" }, 401: { description: "Unauthorized" } },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile and reading preferences",
        responses: { 200: { description: "Profile updated" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Soft delete user account",
        responses: { 200: { description: "Account deleted" } },
      },
    },
    "/users/me/avatar": {
      post: {
        tags: ["Users"],
        summary: "Upload and update user profile picture",
        responses: { 200: { description: "Avatar updated" } },
      },
    },
    "/ai/recommend": {
      post: {
        tags: ["AI Features"],
        summary: "Get AI book recommendations from natural language search query",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { query: { type: "string", example: "Sci-fi with time travel and philosophy" } } } } },
        },
        responses: { 200: { description: "AI recommendations returned" } },
      },
    },
    "/ai/chat": {
      post: {
        tags: ["AI Features"],
        summary: "Chat with BookBuddy AI Assistant",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" }, conversationId: { type: "string" } } } } },
        },
        responses: { 200: { description: "Assistant reply returned" } },
      },
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Retrieve system statistics (Admin only)",
        responses: { 200: { description: "Dashboard stats returned" }, 403: { description: "Forbidden" } },
      },
    },
  },
};
