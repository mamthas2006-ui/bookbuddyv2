import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./apiClient";

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingTime: string;
  rating: number;
  why: string;
}

export function useAISearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data } = await api.post<{ books: BookRecommendation[]; insight: string }>("/ai/search", { query });
      return data;
    },
  });
}

export function useMovieToBook() {
  return useMutation({
    mutationFn: async (movie: string) => {
      const { data } = await api.post<{ books: BookRecommendation[]; insight: string }>("/ai/movie-to-book", { movie });
      return data;
    },
  });
}

export function useMoodToBook() {
  return useMutation({
    mutationFn: async (mood: string) => {
      const { data } = await api.post<{ books: BookRecommendation[]; insight: string }>("/ai/mood-to-book", { mood });
      return data;
    },
  });
}

export function useBookSummary(bookId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["book-summary", bookId],
    queryFn: async () => {
      const { data } = await api.get<{ summary: string }>(`/ai/books/${bookId}/summary`);
      return data.summary;
    },
    enabled,
  });
}

export function useChatSend() {
  return useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId?: string; message: string }) => {
      const { data } = await api.post<{ conversationId: string; reply: string }>("/ai/chat", { conversationId, message });
      return data;
    },
  });
}
