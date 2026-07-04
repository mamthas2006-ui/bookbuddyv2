import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendResponse, sendPaginatedResponse } from "../utils/response";
import { UsersService } from "../services/users.service";
import { STATUS_CODES } from "../constants";

const usersService = new UsersService();

export const updateProfileSchema = z.object({
  age: z.number().optional(),
  favoriteGenres: z.array(z.string()).optional(),
  readingGoal: z.string().optional(),
  weeklyReadingTime: z.number().optional(),
  favoriteMovies: z.string().optional(),
  favoriteAuthors: z.string().optional(),
  preferredLanguage: z.string().optional(),
  darkMode: z.boolean().optional(),
  notificationsOn: z.boolean().optional(),
});

export const readingProgressSchema = z.object({
  bookId: z.string().uuid(),
  status: z.enum(["WISHLIST", "READING", "COMPLETED", "DROPPED"]).optional(),
  progressPct: z.number().min(0).max(100).optional(),
  minutesRead: z.number().min(0).optional(),
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await usersService.listUsers(req.query as any);
  return sendPaginatedResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Users retrieved successfully",
    items: result.users,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit) || 1,
      hasNextPage: result.page * result.limit < result.total,
      hasPrevPage: result.page > 1,
    },
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { profile: true },
  });
  if (!user) throw new AppError("User not found", 404);
  const { passwordHash, resetToken, emailVerifyToken, ...safe } = user;
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Profile retrieved successfully",
    data: safe,
  });
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await usersService.getProfile(req.params.id);
  const { passwordHash, resetToken, emailVerifyToken, ...safe } = user as any;
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User profile retrieved successfully",
    data: safe,
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = req.body;
  const { darkMode, notificationsOn, ...profileFields } = data;

  if (darkMode !== undefined || notificationsOn !== undefined) {
    await prisma.user.update({ where: { id: req.user!.id }, data: { darkMode, notificationsOn } });
  }

  const profile = await prisma.profile.update({ where: { userId: req.user!.id }, data: profileFields });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Profile updated successfully",
    data: profile,
  });
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  await usersService.deleteAccount(req.user!.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Account deleted successfully",
    data: null,
  });
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId } = req.params;
  const existing = await prisma.favorite.findUnique({ where: { userId_bookId: { userId: req.user!.id, bookId } } });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return sendResponse(res, { statusCode: STATUS_CODES.OK, message: "Removed from favorites", data: { favorited: false } });
  }
  await prisma.favorite.create({ data: { userId: req.user!.id, bookId } });
  return sendResponse(res, { statusCode: STATUS_CODES.OK, message: "Added to favorites", data: { favorited: true } });
});

export const toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId } = req.params;
  const existing = await prisma.bookmark.findUnique({ where: { userId_bookId: { userId: req.user!.id, bookId } } });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return sendResponse(res, { statusCode: STATUS_CODES.OK, message: "Removed bookmark", data: { bookmarked: false } });
  }
  await prisma.bookmark.create({ data: { userId: req.user!.id, bookId } });
  return sendResponse(res, { statusCode: STATUS_CODES.OK, message: "Bookmarked successfully", data: { bookmarked: true } });
});

export const getLibrary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [favorites, bookmarks, history] = await Promise.all([
    prisma.favorite.findMany({ where: { userId: req.user!.id }, include: { book: { include: { author: true } } } }),
    prisma.bookmark.findMany({ where: { userId: req.user!.id }, include: { book: { include: { author: true } } } }),
    prisma.readingHistory.findMany({ where: { userId: req.user!.id }, include: { book: { include: { author: true } } }, orderBy: { startedAt: "desc" } }),
  ]);

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Library retrieved successfully",
    data: {
      favorites: favorites.map((f) => f.book),
      bookmarks: bookmarks.map((b) => b.book),
      reading: history.filter((h) => h.status === "READING"),
      completed: history.filter((h) => h.status === "COMPLETED"),
      wishlist: history.filter((h) => h.status === "WISHLIST"),
    },
  });
});

export const updateReadingProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookId, status, progressPct, minutesRead } = req.body;

  const existing = await prisma.readingHistory.findFirst({ where: { userId: req.user!.id, bookId } });

  const data: any = {};
  if (status) data.status = status;
  if (progressPct !== undefined) data.progressPct = progressPct;
  if (minutesRead !== undefined) data.minutesRead = { increment: minutesRead };
  if (status === "COMPLETED") data.completedAt = new Date();

  const record = existing
    ? await prisma.readingHistory.update({ where: { id: existing.id }, data })
    : await prisma.readingHistory.create({ data: { userId: req.user!.id, bookId, status: status || "READING", progressPct: progressPct || 0 } });

  if (minutesRead && minutesRead > 0) {
    await updateStreak(req.user!.id);
  }

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Reading progress updated successfully",
    data: record,
  });
});

async function updateStreak(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastRead = profile.lastReadDate ? new Date(profile.lastReadDate) : null;
  if (lastRead) lastRead.setHours(0, 0, 0, 0);

  let streak = profile.streak;
  if (!lastRead || lastRead.getTime() === today.getTime()) {
    // already counted today, no change
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    streak = lastRead.getTime() === yesterday.getTime() ? streak + 1 : 1;
  }

  await prisma.profile.update({
    where: { userId },
    data: { streak, longestStreak: Math.max(streak, profile.longestStreak), lastReadDate: today, xp: { increment: 10 } },
  });
}

export const getAchievements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [all, earned] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId: req.user!.id } }),
  ]);
  const earnedIds = new Set(earned.map((e) => e.achievementId));
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Achievements retrieved successfully",
    data: all.map((a) => ({ ...a, earned: earnedIds.has(a.id) })),
  });
});

