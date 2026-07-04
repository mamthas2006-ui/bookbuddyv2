import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { STATUS_CODES } from "../constants";
import { ApiErrorResponse } from "../types";

/**
 * Format Zod errors into standard enterprise error array
 */
function formatZodErrors(error: any): Array<{ field?: string; message: string }> {
  const errs = error?.errors || error?.issues || [];
  if (!Array.isArray(errs)) {
    return [{ field: "unknown", message: error?.message || "Validation error" }];
  }
  return errs.map((err: any) => ({
    field: err.path?.join(".") || "unknown",
    message: err.message || "Invalid value",
  }));
}

/**
 * Validate entire request (body, query, params, headers) against a wrapper Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      if (!result.success) {
        const payload: ApiErrorResponse = {
          success: false,
          message: "Validation failed for request",
          errors: formatZodErrors(result.error),
        };
        return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(payload);
      }
      const data = result.data as any;
      if (data?.body !== undefined) req.body = data.body;
      if (data?.query !== undefined) req.query = data.query;
      if (data?.params !== undefined) req.params = data.params;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}


/** Validates req.body against a zod schema; replaces body with the parsed (typed) result. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const payload: ApiErrorResponse = {
        success: false,
        message: "Validation failed for request body",
        errors: formatZodErrors(result.error),
      };
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(payload);
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const payload: ApiErrorResponse = {
        success: false,
        message: "Invalid query parameters",
        errors: formatZodErrors(result.error),
      };
      return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json(payload);
    }
    req.query = result.data as any;
    next();
  };
}

