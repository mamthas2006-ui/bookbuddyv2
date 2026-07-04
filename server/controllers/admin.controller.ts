import { Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendResponse, sendPaginatedResponse } from "../utils/response";
import { AdminService } from "../services/admin.service";
import { STATUS_CODES } from "../constants";

const adminService = new AdminService();

export const dashboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await adminService.getDashboardStats();
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Admin dashboard statistics retrieved successfully",
    data: stats,
  });
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, emailVerified: true, isSuspended: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return sendPaginatedResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Users retrieved successfully",
    items: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

export const suspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const user = await adminService.suspendUser(req.params.id, reason);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User suspended successfully",
    data: user,
  });
});

export const restoreUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await adminService.restoreUser(req.params.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User restored successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await adminService.deleteUserPermanently(req.params.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User deleted successfully",
    data: null,
  });
});

export const viewReports = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const reports = await adminService.getSystemReports();
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "System reports retrieved successfully",
    data: reports,
  });
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User role updated successfully",
    data: { id: user.id, role: user.role },
  });
});

export const banUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.refreshToken.updateMany({ where: { userId: req.params.id }, data: { revoked: true } });
  await prisma.auditLog.create({ data: { userId: req.user!.id, action: "BAN_USER", details: { targetUserId: req.params.id } } });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "User sessions revoked and banned",
    data: null,
  });
});

export const aiUsageStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const events = await prisma.analytics.groupBy({
    by: ["event"],
    _count: { event: true },
    where: { event: { in: ["ai_search", "ai_chat", "ai_summary"] } },
  });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "AI usage stats retrieved successfully",
    data: events.map((e) => ({ event: e.event, count: e._count.event })),
  });
});

export const listFeedback = asyncHandler(async (_req: AuthRequest, res: Response) => {
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Feedback list retrieved successfully",
    data: [],
  });
});

export const auditLogs = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { name: true, email: true } } } });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Audit logs retrieved successfully",
    data: logs,
  });
});

