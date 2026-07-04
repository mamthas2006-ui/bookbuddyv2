import { Request } from "express";
import { Role } from "../constants";

/**
 * Standardized Enterprise API Response Interface
 */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Standardized Enterprise API Error Response Interface
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated Result Wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * JWT Access Token Payload
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated Express Request
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
  id?: string; // Request ID for tracing
}

/**
 * Common Pagination & Filtering Query Parameters
 */
export interface BaseFilterQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}

export interface UserFilterQuery extends BaseFilterQuery {
  role?: Role;
  isSuspended?: boolean;
}

export interface BookFilterQuery extends BaseFilterQuery {
  genre?: string;
  author?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language?: string;
  minRating?: number;
  year?: number;
}
