import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { logger } from "../utils/logger";

export interface LoggedRequest extends Request {
  id?: string;
  startTime?: number;
}

/**
 * Request ID & HTTP Request Logging Middleware
 */
export function requestLogger(req: LoggedRequest, res: Response, next: NextFunction) {
  // Generate or propagate request ID
  const requestId = (req.headers["x-request-id"] as string) || uuid();
  req.id = requestId;
  req.startTime = Date.now();

  res.setHeader("X-Request-ID", requestId);

  // Log on response finish
  res.on("finish", () => {
    const duration = Date.now() - (req.startTime || Date.now());
    const statusCode = res.statusCode;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      status: statusCode,
      durationMs: duration,
      ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    if (statusCode >= 500) {
      logger.error(logData, `HTTP ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);
    } else if (statusCode >= 400) {
      logger.warn(logData, `HTTP ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);
    } else {
      logger.info(logData, `HTTP ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);
    }
  });

  next();
}
