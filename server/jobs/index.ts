import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

/**
 * Prune revoked and expired refresh tokens from the database.
 * Run daily or periodically to keep the tokens table clean.
 */
export async function pruneExpiredTokensJob(): Promise<void> {
  try {
    const now = new Date();
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { revoked: true },
        ],
      },
    });
    logger.info({ count: result.count }, `Background Job: Pruned ${result.count} expired/revoked refresh tokens.`);
  } catch (error) {
    logger.error({ error }, "Background Job Error: Failed to prune expired tokens.");
  }
}

/**
 * Initialize background jobs scheduler
 */
export function initJobs(): void {
  // Prune tokens immediately on startup, then every 24 hours
  setTimeout(() => pruneExpiredTokensJob(), 10000);
  setInterval(() => pruneExpiredTokensJob(), 24 * 60 * 60 * 1000);
  logger.info("Background jobs initialized.");
}
