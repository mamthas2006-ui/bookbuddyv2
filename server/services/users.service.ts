import { UsersRepository } from "../repositories/users.repository";
import { CacheService } from "../cache";
import { UserFilterQuery } from "../types";
import { UpdateProfileInput } from "../validation/users.validation";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";

const usersRepo = new UsersRepository();

export class UsersService {
  async listUsers(query: UserFilterQuery) {
    return usersRepo.findPaginated(query);
  }

  async getProfile(userId: string) {
    return CacheService.getUserProfile(userId, async () => {
      const user = await usersRepo.findById(userId);
      if (!user) {
        throw new AppError("User profile not found", 404);
      }
      return user;
    });
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updated = await usersRepo.updateProfile(userId, input);
    await CacheService.invalidateUserProfile(userId);
    logger.info({ userId }, "User profile updated successfully");
    return updated;
  }

  async deleteAccount(userId: string) {
    await usersRepo.softDelete(userId);
    await CacheService.invalidateUserProfile(userId);
    logger.info({ userId }, "User account soft-deleted");
  }
}
