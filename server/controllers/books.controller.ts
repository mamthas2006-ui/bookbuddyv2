import { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendResponse, sendPaginatedResponse } from "../utils/response";
import { BooksService } from "../services/books.service";
import { STATUS_CODES } from "../constants";

const booksService = new BooksService();

export const listQuerySchema = z.object({
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
});

export const createBookSchema = z.object({
  title: z.string().min(1),
  authorName: z.string().min(1),
  publisherName: z.string().optional(),
  description: z.string().min(1),
  genres: z.array(z.string()).default([]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  language: z.string().default("English"),
  publicationYear: z.number().optional(),
  pageCount: z.number().optional(),
  readingTimeMins: z.number().optional(),
  coverEmoji: z.string().optional(),
  coverUrl: z.string().optional(),
  isbn: z.string().optional(),
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await booksService.listBooks(req.query as any);
  return sendPaginatedResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Books retrieved successfully",
    items: result.books,
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

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const book = await booksService.getBookById(req.params.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Book retrieved successfully",
    data: book,
  });
});

export const getSimilar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const similar = await booksService.getSimilarBooks(req.params.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Similar books retrieved successfully",
    data: similar,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const book = await booksService.createBook(req.body);
  return sendResponse(res, {
    statusCode: STATUS_CODES.CREATED,
    message: "Book created successfully",
    data: book,
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const book = await booksService.updateBook(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Book updated successfully",
    data: book,
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await booksService.deleteBook(req.params.id);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Book deleted successfully",
    data: null,
  });
});

export const trending = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const result = await booksService.getTrendingBooks(10);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Trending books retrieved successfully",
    data: result,
  });
});

