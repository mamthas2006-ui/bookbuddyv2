import { cached, invalidate, redis } from "../config/redis";
import { CACHE_KEYS, CACHE_TTL } from "../constants";
import { logger } from "../utils/logger";

export { cached, invalidate, redis, CACHE_KEYS, CACHE_TTL };

/**
 * Enterprise Cache Service
 * Provides typed helpers for frequently accessed data with automatic TTL and pattern invalidation.
 */
export class CacheService {
  /**
   * Get or compute user profile cache
   */
  static async getUserProfile<T>(userId: string, computeFn: () => Promise<T>): Promise<T> {
    const key = CACHE_KEYS.USER_PROFILE(userId);
    return cached(key, CACHE_TTL.MEDIUM, computeFn);
  }

  /**
   * Invalidate user profile cache
   */
  static async invalidateUserProfile(userId: string): Promise<void> {
    const key = CACHE_KEYS.USER_PROFILE(userId);
    await invalidate(key);
    logger.debug({ userId }, "Invalidated user profile cache");
  }

  /**
   * Invalidate all book list queries
   */
  static async invalidateBooksList(): Promise<void> {
    await invalidate("books:list:*");
    await invalidate(CACHE_KEYS.BOOKS_TRENDING);
    logger.debug("Invalidated books list cache");
  }

  /**
   * Invalidate admin stats
   */
  static async invalidateAdminStats(): Promise<void> {
    await invalidate(CACHE_KEYS.ADMIN_STATS);
    logger.debug("Invalidated admin stats cache");
  }
}
