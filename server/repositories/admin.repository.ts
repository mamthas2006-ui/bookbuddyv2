import { prisma } from "../config/prisma";

export class AdminRepository {
  async getDashboardStats() {
    const [totalUsers, totalBooks, totalReviews, activeSessions] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.book.count({ where: { deletedAt: null } }),
      prisma.review.count(),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    ]);

    // Calculate level distribution
    const levelCounts = await prisma.profile.groupBy({
      by: ["readingLevel"],
      _count: { readingLevel: true },
    });

    const levelBreakdown = {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
    };
    levelCounts.forEach((l) => {
      if (l.readingLevel in levelBreakdown) {
        levelBreakdown[l.readingLevel as keyof typeof levelBreakdown] = l._count.readingLevel;
      }
    });

    return {
      stats: {
        totalUsers,
        totalBooks,
        totalReviews,
        activeSessions,
      },
      levelBreakdown,
      timestamp: new Date().toISOString(),
    };
  }

  async updateUserSuspension(userId: string, isSuspended: boolean, _reason?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuspended: true,
      },
    });
  }

  async getSystemReports() {
    const recentUsers = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, name: true, createdAt: true, role: true },
    });

    const recentBooks = await prisma.book.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, author: { select: { name: true } }, averageRating: true, createdAt: true },
    });

    return {
      recentUsers,
      recentBooks,
      generatedAt: new Date().toISOString(),
    };
  }
}
