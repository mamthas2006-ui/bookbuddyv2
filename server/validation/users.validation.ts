import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    darkMode: z.boolean().optional(),
    notificationsOn: z.boolean().optional(),
    age: z.number().int().min(5).max(120).optional().nullable(),
    readingGoal: z.string().max(200).optional().nullable(),
    weeklyReadingTime: z.number().min(0).max(168).optional().nullable(),
    favoriteGenres: z.array(z.string()).optional(),
    favoriteMovies: z.string().max(300).optional().nullable(),
    preferredLanguage: z.string().optional(),
    readingLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  }),
});

export const userListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    sort: z.enum(["name", "createdAt", "email", "xp"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional(),
    isSuspended: z.enum(["true", "false"]).optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
