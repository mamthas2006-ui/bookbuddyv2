import { z } from "zod";

export const listBooksQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    genre: z.string().optional(),
    author: z.string().optional(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    language: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    year: z.coerce.number().optional(),
    search: z.string().optional(),
    sort: z.enum(["rating", "newest", "title"]).default("rating"),
  }),
});

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    authorName: z.string().min(1, "Author name is required"),
    publisherName: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    genres: z.array(z.string()).default([]),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
    language: z.string().default("English"),
    publicationYear: z.number().int().optional(),
    pageCount: z.number().int().optional(),
    readingTimeMins: z.number().int().optional(),
    coverEmoji: z.string().optional(),
    coverUrl: z.string().url().optional(),
    isbn: z.string().optional(),
  }),
});

export const updateBookSchema = z.object({
  body: createBookSchema.shape.body.partial(),
});

export const bookIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Book ID is required"),
  }),
});

export type CreateBookInput = z.infer<typeof createBookSchema>["body"];
export type UpdateBookInput = z.infer<typeof updateBookSchema>["body"];
