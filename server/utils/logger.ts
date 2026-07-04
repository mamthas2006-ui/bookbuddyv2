import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Enterprise Pino Logger Configuration
 * Structured logging with support for JSON logs in production and readable formatting in development.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  base: {
    env: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
});

/**
 * Log startup events
 */
export function logStartupEvent(message: string, details?: Record<string, unknown>) {
  logger.info({ event: "STARTUP", ...details }, message);
}

/**
 * Log authentication events
 */
export function logAuthEvent(action: string, userId?: string, email?: string, ip?: string, success = true) {
  logger.info({ event: "AUTH", action, userId, email, ip, success }, `Authentication ${action}: ${success ? "SUCCESS" : "FAILED"}`);
}

/**
 * Log database errors
 */
export function logDbError(operation: string, error: unknown, metadata?: Record<string, unknown>) {
  logger.error({ event: "DB_ERROR", operation, error, ...metadata }, `Database error during ${operation}`);
}

/**
 * Log performance metrics
 */
export function logPerformance(operation: string, durationMs: number, metadata?: Record<string, unknown>) {
  if (durationMs > 500) {
    logger.warn({ event: "SLOW_PERF", operation, durationMs, ...metadata }, `Slow operation detected: ${operation} (${durationMs}ms)`);
  } else {
    logger.debug({ event: "PERF", operation, durationMs, ...metadata }, `Performance: ${operation} (${durationMs}ms)`);
  }
}
