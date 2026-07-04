import { AdminRepository } from "../repositories/admin.repository";
import { CacheService, cached } from "../cache";
import { UsersRepository } from "../repositories/users.repository";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { CACHE_KEYS, CACHE_TTL } from "../constants";

const adminRepo = new AdminRepository();
const usersRepo = new UsersRepository();

export class AdminService {
  async getDashboardStats() {
    return cached(CACHE_KEYS.ADMIN_STATS, CACHE_TTL.SHORT, async () => {
      return adminRepo.getDashboardStats();
    });
  }

  async suspendUser(userId: string, reason?: string) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user.role === "ADMIN") {
      throw new AppError("Cannot suspend another administrator account", 403);
    }
    const updated = await adminRepo.updateUserSuspension(userId, true, reason);
    await CacheService.invalidateUserProfile(userId);
    await CacheService.invalidateAdminStats();
    logger.warn({ adminAction: "SUSPEND_USER", targetUserId: userId, reason }, "User account suspended by admin");
    return updated;
  }

  async restoreUser(userId: string) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const updated = await adminRepo.updateUserSuspension(userId, false);
    await CacheService.invalidateUserProfile(userId);
    await CacheService.invalidateAdminStats();
    logger.info({ adminAction: "RESTORE_USER", targetUserId: userId }, "User account restored by admin");
    return updated;
  }

  async deleteUserPermanently(userId: string) {
    const user = await usersRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user.role === "ADMIN") {
      throw new AppError("Cannot delete administrator account", 403);
    }
    await usersRepo.softDelete(userId);
    await CacheService.invalidateUserProfile(userId);
    await CacheService.invalidateAdminStats();
    logger.warn({ adminAction: "DELETE_USER", targetUserId: userId }, "User account soft-deleted by admin");
  }

  async getSystemReports() {
    return adminRepo.getSystemReports();
  }
}
