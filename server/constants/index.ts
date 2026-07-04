/**
 * Enterprise Application Constants
 * Follows DRY principles and standard naming conventions.
 */

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_ORDER: "desc" as const,
};

export const CACHE_KEYS = {
  USER_PROFILE: (id: string) => `user:profile:${id}`,
  BOOKS_LIST: (query: string) => `books:list:${query}`,
  BOOKS_TRENDING: "books:trending",
  ADMIN_STATS: "admin:dashboard:stats",
} as const;

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

export const TOKEN_EXPIRY = {
  ACCESS: "15m",
  REFRESH: "7d",
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour in ms
} as const;
