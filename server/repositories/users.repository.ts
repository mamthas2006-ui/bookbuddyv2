import { prisma } from "../config/prisma";
import { UserFilterQuery } from "../types";
import { getPaginationArgs } from "../helpers";
import { UpdateProfileInput } from "../validation/users.validation";

export class UsersRepository {
  async findPaginated(query: UserFilterQuery) {
    const { skip, take, page, limit } = getPaginationArgs(query);
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (query.role) where.role = query.role;
    if (query.isSuspended !== undefined) where.isSuspended = query.isSuspended;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, "asc" | "desc"> = {};
    const sortField = query.sort || "createdAt";
    orderBy[sortField] = query.order || "desc";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isSuspended: true,
          createdAt: true,
          profile: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const userUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.avatarUrl !== undefined) userUpdate.avatarUrl = data.avatarUrl;
    if (data.darkMode !== undefined) userUpdate.darkMode = data.darkMode;
    if (data.notificationsOn !== undefined) userUpdate.notificationsOn = data.notificationsOn;

    const profileUpdate: Record<string, unknown> = {};
    if (data.age !== undefined) profileUpdate.age = data.age;
    if (data.readingGoal !== undefined) profileUpdate.readingGoal = data.readingGoal;
    if (data.weeklyReadingTime !== undefined) profileUpdate.weeklyReadingTime = data.weeklyReadingTime;
    if (data.favoriteGenres !== undefined) profileUpdate.favoriteGenres = data.favoriteGenres;
    if (data.favoriteMovies !== undefined) profileUpdate.favoriteMovies = data.favoriteMovies;
    if (data.preferredLanguage !== undefined) profileUpdate.preferredLanguage = data.preferredLanguage;
    if (data.readingLevel !== undefined) profileUpdate.readingLevel = data.readingLevel;

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...userUpdate,
        profile: {
          upsert: {
            create: profileUpdate,
            update: profileUpdate,
          },
        },
      },
      include: { profile: true },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
