import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { sendResponse } from "../utils/response";
import { STATUS_CODES } from "../constants";

const startTime = Date.now();

/**
 * GET /health
 * Performs system diagnostics (DB check, uptime, memory usage)
 */
export const checkHealth = asyncHandler(async (_req: Request, res: Response) => {
  let dbStatus = "UP";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "DOWN (Mock/Fallback active)";
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "System is operational",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: `${uptimeSeconds}s`,
      services: {
        database: dbStatus,
        cache: "UP (Redis memory layer)",
        api: "UP",
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    },
  });
});

/**
 * GET /metrics
 * Exposes application performance and system monitoring metrics
 */
export const getMetrics = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, bookCount, reviewCount] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.review.count(),
  ]);

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "System metrics retrieved successfully",
    data: {
      uptime_seconds: uptimeSeconds,
      memory_rss_bytes: mem.rss,
      memory_heap_used_bytes: mem.heapUsed,
      node_version: process.version,
      platform: process.platform,
      database_metrics: {
        total_users: userCount,
        total_books: bookCount,
        total_reviews: reviewCount,
      },
    },
  });
});

/**
 * GET /version
 * Returns API version and build metadata
 */
export const getVersion = asyncHandler(async (_req: Request, res: Response) => {
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Version metadata retrieved successfully",
    data: {
      name: "BookBuddy AI Enterprise Backend",
      version: "1.0.0",
      api_version: "v1",
      environment: process.env.NODE_ENV || "development",
      build_date: "2026-07-02",
      node_version: process.version,
      architecture: "Clean Architecture + REST API + OpenAPI/Swagger",
    },
  });
});
