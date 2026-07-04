import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { securityHeaders, corsMiddleware, sanitizeInputs } from "./middleware/security.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { swaggerDocument } from "./docs/swagger";

export function createApp() {
  const app = express();

  // 1. Enterprise Security Headers & CORS
  app.use(securityHeaders);
  app.use(corsMiddleware);

  // 2. Request Logging & ID Injection
  app.use(requestLogger);

  // 3. Compression & Body Parsing
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 4. Input Sanitization against XSS
  app.use(sanitizeInputs);

  // 5. HTTP Access Logs & General Rate Limiting
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/api", apiLimiter);

  // 6. Static Serving for Uploads CDN
  const uploadsDir = path.join(process.cwd(), "server", "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // 7. Swagger/OpenAPI Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "BookBuddy AI - Enterprise API Docs",
  }));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerDocument));

  // 8. Mount REST API Routes
  app.use("/api/v1", routes);

  // 9. Centralized Error Handling & 404
  app.use("/api", notFoundHandler);
  app.use("/api", errorHandler);

  return app;
}

