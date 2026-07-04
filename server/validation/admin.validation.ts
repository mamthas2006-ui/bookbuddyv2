import { z } from "zod";

export const adminUserActionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export const suspendUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    reason: z.string().optional(),
    durationDays: z.number().int().min(1).max(365).optional(),
  }),
});

export const viewReportsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    type: z.enum(["user_growth", "book_activity", "ai_usage", "system_errors"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
