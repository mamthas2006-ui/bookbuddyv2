import { Response } from "express";
import { ApiResponse, ApiErrorResponse, PaginationMeta } from "../types";
import { STATUS_CODES } from "../constants";

/**
 * Send standardized success response
 */
export function sendResponse<T>(
  res: Response,
  {
    statusCode = STATUS_CODES.OK,
    message = "Success",
    data = {} as T,
    meta,
  }: {
    statusCode?: number;
    message?: string;
    data?: T;
    meta?: Record<string, unknown> | PaginationMeta;
  }
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta: meta as Record<string, unknown> } : {}),
  };
  return res.status(statusCode).json(payload);
}

/**
 * Send standardized paginated success response
 */
export function sendPaginatedResponse<T>(
  res: Response,
  {
    statusCode = STATUS_CODES.OK,
    message = "Success",
    items,
    meta,
  }: {
    statusCode?: number;
    message?: string;
    items: T[];
    meta: PaginationMeta;
  }
): Response {
  return sendResponse(res, {
    statusCode,
    message,
    data: items,
    meta: meta as unknown as Record<string, unknown>,
  });
}

/**
 * Send standardized error response
 */
export function sendError(
  res: Response,
  {
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
    message = "Internal Server Error",
    errors = [],
  }: {
    statusCode?: number;
    message?: string;
    errors?: Array<{ field?: string; message: string; code?: string }>;
  }
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {}),
  };
  return res.status(statusCode).json(payload);
}
