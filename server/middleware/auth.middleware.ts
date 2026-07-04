import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { STATUS_CODES } from "../constants";
import { ApiErrorResponse } from "../types";

export type { AuthRequest };

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Authentication required. Please log in.",
    };
    return res.status(STATUS_CODES.UNAUTHORIZED).json(payload);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role as any,
    };
    next();
  } catch {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Invalid or expired access token.",
    };
    return res.status(STATUS_CODES.UNAUTHORIZED).json(payload);
  }
}

/** Allows the request through whether or not a valid token is present; populates req.user if so. */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role as any,
      };
    } catch {
      // ignore invalid token, proceed unauthenticated
    }
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const payload: ApiErrorResponse = {
        success: false,
        message: "Forbidden: You do not have sufficient permissions to perform this action.",
      };
      return res.status(STATUS_CODES.FORBIDDEN).json(payload);
    }
    next();
  };
}

