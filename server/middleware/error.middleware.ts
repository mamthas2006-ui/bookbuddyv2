import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { STATUS_CODES } from "../constants";
import { ApiErrorResponse } from "../types";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Array<{ field?: string; message: string; code?: string }>;

  constructor(
    message: string,
    statusCode: number = STATUS_CODES.BAD_REQUEST,
    errors?: Array<{ field?: string; message: string; code?: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Wraps async route handlers so rejected promises reach the error middleware. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  const payload: ApiErrorResponse = {
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl || req.path}`,
  };
  res.status(STATUS_CODES.NOT_FOUND).json(payload);
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : STATUS_CODES.INTERNAL_SERVER_ERROR;

  // Log error details with request ID and path
  if (!isAppError || statusCode >= 500) {
    logger.error(
      {
        err,
        method: req.method,
        path: req.originalUrl || req.path,
        ip: req.ip,
      },
      "Unhandled Internal Server Error"
    );
  } else {
    logger.warn(
      {
        statusCode,
        message: err.message,
        method: req.method,
        path: req.originalUrl || req.path,
      },
      "Operational Application Error"
    );
  }

  // Never expose internal server errors or stack traces to end users in production
  const message =
    !isAppError || statusCode >= 500
      ? "An unexpected internal server error occurred. Please try again later."
      : err.message;

  const payload: ApiErrorResponse = {
    success: false,
    message,
    ...(isAppError && err.errors ? { errors: err.errors } : {}),
  };

  res.status(statusCode).json(payload);
}

