import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { STATUS_CODES } from "../constants";

/** General API rate limiter. */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
});

/** Stricter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later" },
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
});

/** AI endpoints are expensive — limit per-user request bursts. */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests — please slow down" },
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS,
});

