import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError, asyncHandler } from "../middleware/error.middleware";
import { AuthRequest } from "../types";
import { sendResponse } from "../utils/response";
import { STATUS_CODES } from "../constants";
import {
  getAIRecommendations,
  getMovieToBookRecommendations,
  getMoodRecommendations,
  generateReaderPersonality,
  generateBookSummary,
  generateBookReview,
  chatWithAssistant,
  streamChatWithAssistant,
  chatWithCharacter,
  analyzeQuote,
  generatePaceCoaching,
} from "../services/ai.service";

export const searchSchema = z.object({ query: z.string().min(2).max(300) });
export const movieSchema = z.object({ movie: z.string().min(1).max(150) });
export const moodSchema = z.object({ mood: z.string().min(1).max(60) });
export const characterChatSchema = z.object({
  characterName: z.string().min(1).max(100),
  bookTitle: z.string().min(1).max(150),
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});
export const quoteSchema = z.object({
  quote: z.string().min(3).max(1000),
  bookTitle: z.string().optional(),
});
export const paceSchema = z.object({
  bookTitle: z.string().min(1).max(200),
  totalPages: z.number().min(1).max(10000),
  daysToFinish: z.number().min(1).max(365),
});
export const personalitySchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  genres: z.array(z.string()),
  goal: z.string(),
  weeklyTime: z.number(),
  movies: z.string().optional(),
  mood: z.string(),
  level: z.string(),
});
export const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
});

export const search = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query } = req.body;
  const result = await getAIRecommendations(query);

  if (req.user) {
    await Promise.all(
      result.books.map((b) =>
        prisma.analytics.create({ data: { event: "ai_search", userId: req.user!.id, metadata: { query, book: b.title } } })
      )
    );
  }

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "AI recommendations retrieved successfully",
    data: result,
  });
});

export const movieToBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { movie } = req.body;
  const result = await getMovieToBookRecommendations(movie);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Movie-to-book recommendations retrieved successfully",
    data: result,
  });
});

export const moodToBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { mood } = req.body;
  const result = await getMoodRecommendations(mood);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Mood recommendations retrieved successfully",
    data: result,
  });
});

export const readerPersonality = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required", 401);
  const profile = await generateReaderPersonality(req.body);

  await prisma.profile.update({
    where: { userId: req.user.id },
    data: {
      favoriteGenres: req.body.genres,
      readingGoal: req.body.goal,
      weeklyReadingTime: req.body.weeklyTime,
      favoriteMovies: req.body.movies,
      moodPreferences: [req.body.mood],
      readingLevel: req.body.level.toUpperCase() as any,
      personalityName: profile.name,
      personalityEmoji: profile.emoji,
      personalityDesc: profile.description,
    },
  });

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Reader personality generated and saved successfully",
    data: profile,
  });
});

export const bookSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.bookId }, include: { author: true } });
  if (!book) throw new AppError("Book not found", 404);

  if (book.aiSummary) {
    return sendResponse(res, {
      statusCode: STATUS_CODES.OK,
      message: "Book summary retrieved from cache",
      data: { summary: book.aiSummary, cached: true },
    });
  }

  const summary = await generateBookSummary(book.title, book.author.name);
  await prisma.book.update({ where: { id: book.id }, data: { aiSummary: summary } });
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Book summary generated successfully",
    data: { summary, cached: false },
  });
});

export const bookReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.bookId }, include: { author: true } });
  if (!book) throw new AppError("Book not found", 404);

  const review = await generateBookReview(book.title, book.author.name);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Book review generated successfully",
    data: { review },
  });
});

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required", 401);
  const { conversationId, message } = req.body;

  let conversation = conversationId
    ? await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: req.user.id } })
    : null;

  const existingMessages = (conversation?.messages as any[]) || [];
  const history = [...existingMessages, { role: "user", content: message }];

  const reply = await chatWithAssistant(history);
  const updatedMessages = [...history, { role: "assistant", content: reply }];

  if (conversation) {
    conversation = await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { messages: updatedMessages },
    });
  } else {
    conversation = await prisma.aIConversation.create({
      data: { userId: req.user.id, messages: updatedMessages, title: message.slice(0, 50) },
    });
  }

  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "AI chat reply generated successfully",
    data: { conversationId: conversation.id, reply },
  });
});

export const chatStream = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required", 401);
  const { conversationId, message } = req.body;

  let conversation = conversationId
    ? await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: req.user.id } })
    : null;
  const existingMessages = (conversation?.messages as any[]) || [];
  const history = [...existingMessages, { role: "user", content: message }];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullReply = "";
  for await (const chunk of streamChatWithAssistant(history)) {
    fullReply += chunk;
    res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
  }

  const updatedMessages = [...history, { role: "assistant", content: fullReply }];
  if (conversation) {
    conversation = await prisma.aIConversation.update({ where: { id: conversation.id }, data: { messages: updatedMessages } });
  } else {
    conversation = await prisma.aIConversation.create({
      data: { userId: req.user.id, messages: updatedMessages, title: message.slice(0, 50) },
    });
  }

  res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`);
  res.end();
});

export const characterChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { characterName, bookTitle, message, history = [] } = req.body;
  const reply = await chatWithCharacter(characterName, bookTitle, message, history);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Character reply generated successfully",
    data: { reply },
  });
});

export const quoteAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quote, bookTitle } = req.body;
  const analysis = await analyzeQuote(quote, bookTitle);
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Quote analyzed successfully",
    data: analysis,
  });
});

export const paceCoach = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookTitle, totalPages, daysToFinish } = req.body;
  const plan = await generatePaceCoaching(bookTitle, Number(totalPages), Number(daysToFinish));
  return sendResponse(res, {
    statusCode: STATUS_CODES.OK,
    message: "Pace coaching plan generated successfully",
    data: plan,
  });
});

