import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload } from "../types";

/**
 * Sign JWT Access Token (short-lived, default 15m)
 */
export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.accessExpiry as any,
  };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

/**
 * Sign JWT Refresh Token (long-lived, default 7d)
 */
export function signRefreshToken(payload: { id: string; tokenVersion?: number }): string {
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiry as any,
  };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

/**
 * Verify JWT Access Token
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

/**
 * Verify JWT Refresh Token
 */
export function verifyRefreshToken(token: string): { id: string; iat?: number; exp?: number } {
  return jwt.verify(token, env.jwt.refreshSecret) as { id: string; iat?: number; exp?: number };
}

/**
 * Decode token without verifying (for inspection/debugging)
 */
export function decodeToken<T = JwtPayload>(token: string): T | null {
  return jwt.decode(token) as T | null;
}
