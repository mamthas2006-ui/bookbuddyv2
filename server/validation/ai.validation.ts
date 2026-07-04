import { z } from "zod";

export const aiSearchSchema = z.object({
  body: z.object({
    query: z.string().min(1, "Search query is required").max(500),
  }),
});

export const movieToBookSchema = z.object({
  body: z.object({
    movie: z.string().min(1, "Movie title is required").max(200),
  }),
});

export const moodToBookSchema = z.object({
  body: z.object({
    mood: z.string().min(1, "Mood description is required").max(200),
  }),
});

export const readerPersonalitySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().int().optional().nullable(),
    genres: z.array(z.string()).default([]),
    goal: z.string().default("Read more"),
    weeklyTime: z.number().default(5),
    movies: z.string().optional().nullable(),
    mood: z.string().default("Relaxed"),
    level: z.string().default("BEGINNER"),
  }),
});

export const aiChatSchema = z.object({
  body: z.object({
    conversationId: z.string().optional(),
    message: z.string().min(1, "Message cannot be empty").max(2000),
  }),
});
