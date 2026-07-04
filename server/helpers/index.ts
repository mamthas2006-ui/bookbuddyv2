import { BaseFilterQuery, PaginationMeta } from "../types";
import { PAGINATION_DEFAULTS } from "../constants";

/**
 * Build pagination offset and limit for Prisma queries
 */
export function getPaginationArgs(query: BaseFilterQuery): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.LIMIT)
  );
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

/**
 * Build pagination metadata object
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Sanitize string input (strip basic HTML tags for security)
 */
export function sanitizeString(input?: string): string | undefined {
  if (!input) return input;
  return input.replace(/<[^>]*>?/gm, "").trim();
}
