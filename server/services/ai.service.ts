import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";

let genaiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

let anthropicClient: Anthropic | null = null;
if (env.anthropic.apiKey) {
  anthropicClient = new Anthropic({ apiKey: env.anthropic.apiKey });
}

/** Strips markdown code fences AI sometimes wraps JSON in, then parses. */
function parseJson<T>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === "object") {
      return parsed as T;
    }
    return fallback;
  } catch {
    console.warn("[ai] failed to parse JSON response, using fallback");
    return fallback;
  }
}

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingTime: string;
  rating: number;
  why: string;
}

const FALLBACK_RECS = {
  books: [
    { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", difficulty: "Beginner" as const, readingTime: "5h 20m", rating: 4.8, why: "Practical frameworks for building daily reading consistency." },
    { title: "The Psychology of Money", author: "Morgan Housel", genre: "Finance", difficulty: "Beginner" as const, readingTime: "4h", rating: 4.7, why: "Accessible stories exploring mindset and behavior." },
    { title: "Sapiens", author: "Yuval Noah Harari", genre: "History", difficulty: "Intermediate" as const, readingTime: "8h", rating: 4.9, why: "Fascinating big-picture exploration of human history and culture." }
  ],
  insight: "These books offer transformative perspectives while remaining highly engaging and accessible for any reader."
};

async function generateText(system: string, userPrompt: string, maxTokens = 1000, history: ChatMessage[] = []): Promise<string> {
  try {
    if (genaiClient) {
      const contents = history.length > 0
        ? history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }))
        : [{ role: "user", parts: [{ text: userPrompt }] }];
      
      const res = await genaiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: system,
          maxOutputTokens: maxTokens,
        },
      });
      return res.text ?? "";
    } else if (anthropicClient) {
      const msg = await anthropicClient.messages.create({
        model: env.anthropic.model,
        max_tokens: maxTokens,
        system,
        messages: history.length > 0
          ? history.map((m) => ({ role: m.role, content: m.content }))
          : [{ role: "user", content: userPrompt }],
      });
      return msg.content.find((b) => b.type === "text")?.text ?? "";
    }
  } catch (err: any) {
    console.warn("[ai] API call failed:", err.message);
  }
  return "";
}

/** Free-text discovery search: "I want a sad romance", "books like Interstellar", etc. */
export async function getAIRecommendations(query: string, userContext?: string): Promise<{ books: BookRecommendation[]; insight: string }> {
  const system = "You are BookBuddy AI, a book recommendation engine. Recommend real, existing books with accurate authors. Return ONLY valid JSON, no markdown formatting, no preamble.";
  const prompt = `User query: "${query}".${userContext ? ` User context: ${userContext}.` : ""} Recommend exactly 3 books. Return JSON: {"books":[{"title":"","author":"","genre":"","difficulty":"Beginner|Intermediate|Advanced","readingTime":"","rating":4.5,"why":""}],"insight":"one sentence on why these fit"}`;
  
  const text = await generateText(system, prompt, 1000);
  const res = parseJson(text, FALLBACK_RECS);
  return (res.books && res.books.length > 0) ? res : FALLBACK_RECS;
}

/** Movie-to-book recommendations. */
export async function getMovieToBookRecommendations(movie: string) {
  return getAIRecommendations(`Books with similar themes, tone, or ideas to the movie "${movie}"`);
}

/** Mood-based recommendations. */
export async function getMoodRecommendations(mood: string) {
  return getAIRecommendations(`Books that match someone feeling "${mood}" right now`);
}

/** Generates the onboarding Reader Personality profile. */
export async function generateReaderPersonality(input: {
  name: string;
  age?: number;
  genres: string[];
  goal: string;
  weeklyTime: number;
  movies?: string;
  mood: string;
  level: string;
}): Promise<{ name: string; emoji: string; description: string; genres: string[]; firstBook: string; tip: string }> {
  const system = 'You are BookBuddy AI. Generate a warm, concise Reader Personality from this fixed set: Explorer, Thinker, Dreamer, Scholar, Fantasy Lover, Mystery Hunter (you may lightly adapt the name). Return ONLY valid JSON.';
  const prompt = `User: ${input.name}, age ${input.age ?? "unspecified"}. Genres: ${input.genres.join(", ")}. Goal: ${input.goal}. Weekly reading time: ${input.weeklyTime}h. Favorite movies: ${input.movies ?? "none given"}. Mood: ${input.mood}. Level: ${input.level}. Return JSON: {"name":"","emoji":"","description":"","genres":["","",""],"firstBook":"","tip":""}`;

  const fallback = {
    name: "Explorer",
    emoji: "🧭",
    description: "You love discovering new ideas across many fields.",
    genres: input.genres.slice(0, 3).length ? input.genres.slice(0, 3) : ["Self-Help", "Finance", "History"],
    firstBook: "Atomic Habits",
    tip: "Read 10 pages a day — consistency beats intensity.",
  };

  const text = await generateText(system, prompt, 600);
  return parseJson(text, fallback);
}

/** One-minute AI summary for a book detail page. */
export async function generateBookSummary(title: string, author: string): Promise<string> {
  const system = "You are BookBuddy AI. Give warm, accessible one-minute book summaries for beginner readers, under 80 words, ending with one key takeaway.";
  const prompt = `Summarize "${title}" by ${author}.`;
  const text = await generateText(system, prompt, 300);
  return text || `"${title}" by ${author} is a highly acclaimed read that delivers profound insights and practical takeaways. Key takeaway: Small, consistent actions compound into remarkable transformations over time.`;
}

/** AI review with strengths/ideal reader framing. */
export async function generateBookReview(title: string, author: string): Promise<string> {
  const system = "You are BookBuddy AI. Write honest, warm AI book reviews under 70 words, ending with who the ideal reader is.";
  const prompt = `Review "${title}" by ${author} for a beginner reader.`;
  const text = await generateText(system, prompt, 300);
  return text || `A fantastic starting point for readers seeking clarity and depth without overwhelming jargon. Ideal reader: Anyone looking to elevate their daily routines and mindset through actionable wisdom.`;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Context-aware AI chat assistant — pass full conversation history for memory. */
export async function chatWithAssistant(history: ChatMessage[]): Promise<string> {
  const system = "You are BookBuddy AI, a friendly, context-aware reading companion. Keep answers concise and warm. Recommend specific real books when relevant. Remember earlier turns in this conversation.";
  const text = await generateText(system, "", 800, history);
  return text || "I'd love to help you find your next great book! What kind of genres or themes are you currently feeling in the mood for?";
}

/** Literary Character Chat — talk directly to a book character in their authentic voice and personality. */
export async function chatWithCharacter(characterName: string, bookTitle: string, userMessage: string, history: ChatMessage[]): Promise<string> {
  const system = `You are playing the role of ${characterName} from the book "${bookTitle}". Speak entirely in character, adopting their tone, vocabulary, worldview, and emotional disposition. Never break character. Respond to the user as if they are conversing with you directly in your world or reflecting on your choices. Keep answers engaging, dramatic, and immersive (about 2-4 sentences).`;
  const text = await generateText(system, "", 600, history.concat([{ role: "user", content: userMessage }]));
  return text || `Ah, you seek to speak with ${characterName} from ${bookTitle}. Tell me, what questions weigh upon your mind regarding my journey?`;
}

export interface QuoteAnalysisResult {
  quote: string;
  bookTitle?: string;
  author?: string;
  philosophicalMeaning: string;
  emotionalVibe: string;
  recommendedAesthetic: "Cosmic Noir" | "Vintage Botanical" | "Neon Cyberpunk" | "Minimalist Zen";
  tags: string[];
}

/** Analyze a book quote for philosophical meaning, emotional vibe, and aesthetic pairing. */
export async function analyzeQuote(quoteText: string, bookTitle?: string): Promise<QuoteAnalysisResult> {
  const system = `You are a literary aesthetician and philosophical analyst for BookBuddy AI. Analyze the provided book quote and return valid JSON matching this exact structure:
{
  "quote": "${quoteText.replace(/"/g, '\\"')}",
  "bookTitle": "${bookTitle || "Unknown Book"}",
  "author": "Author Name if known or inferred",
  "philosophicalMeaning": "2-3 sentences explaining the deeper philosophical or psychological truth of this quote.",
  "emotionalVibe": "A concise description of the emotional resonance (e.g. Melancholic Hope, Defiant Courage, Quiet Reflection)",
  "recommendedAesthetic": "One of exactly: Cosmic Noir | Vintage Botanical | Neon Cyberpunk | Minimalist Zen",
  "tags": ["3 to 5 thematic tags"]
}
Return ONLY valid JSON.`;
  const text = await generateText(system, `Analyze this quote: "${quoteText}" ${bookTitle ? `from book "${bookTitle}"` : ""}`, 600);
  return parseJson<QuoteAnalysisResult>(text, {
    quote: quoteText,
    bookTitle: bookTitle || "Classic Literature",
    author: "Unknown Author",
    philosophicalMeaning: "This passage reflects a profound meditation on human endurance, identity, and the passage of time through life's trials.",
    emotionalVibe: "Reflective Resilience",
    recommendedAesthetic: "Vintage Botanical",
    tags: ["Philosophy", "Resilience", "Wisdom", "Reflections"],
  });
}

export interface PaceCoachingResult {
  bookTitle: string;
  totalPages: number;
  daysToFinish: number;
  dailyPageTarget: number;
  dailyMinutesEstimate: number;
  coachingAdvice: string;
  milestones: { day: number; targetPage: number; tip: string }[];
}

/** Generate custom reading pace coaching and milestone breakdowns. */
export async function generatePaceCoaching(bookTitle: string, totalPages: number, daysToFinish: number): Promise<PaceCoachingResult> {
  const dailyTarget = Math.ceil(totalPages / Math.max(1, daysToFinish));
  const dailyMinutes = Math.ceil(dailyTarget * 1.8); // avg ~1.8 mins per page
  const system = `You are BookBuddy AI's Reading Habit Coach. Generate an encouraging, personalized reading strategy for a reader finishing "${bookTitle}" (${totalPages} pages) in ${daysToFinish} days (~${dailyTarget} pages/day). Return valid JSON:
{
  "bookTitle": "${bookTitle}",
  "totalPages": ${totalPages},
  "daysToFinish": ${daysToFinish},
  "dailyPageTarget": ${dailyTarget},
  "dailyMinutesEstimate": ${dailyMinutes},
  "coachingAdvice": "2 encouraging sentences on how to integrate this ${dailyMinutes}-minute reading session into daily life (e.g., morning coffee or bedtime).",
  "milestones": [
    { "day": 1, "targetPage": ${dailyTarget}, "tip": "Starting strong: set the scene and immerse yourself in the opening chapters." },
    { "day": ${Math.max(2, Math.floor(daysToFinish / 2))}, "targetPage": ${Math.floor(totalPages / 2)}, "tip": "Midpoint check: take notes on key character motivations." },
    { "day": ${daysToFinish}, "targetPage": ${totalPages}, "tip": "The grand finale: enjoy the resolution and reflect on the journey!" }
  ]
}
Return ONLY valid JSON.`;
  const text = await generateText(system, `Generate pace schedule for ${bookTitle}`, 600);
  return parseJson<PaceCoachingResult>(text, {
    bookTitle,
    totalPages,
    daysToFinish,
    dailyPageTarget: dailyTarget,
    dailyMinutesEstimate: dailyMinutes,
    coachingAdvice: `To conquer ${bookTitle} in ${daysToFinish} days, dedicate about ${dailyMinutes} minutes each day—perfect for a cozy morning coffee ritual or unwinding before sleep!`,
    milestones: [
      { day: 1, targetPage: dailyTarget, tip: "Get comfortable with the author's voice and world-building." },
      { day: Math.max(2, Math.floor(daysToFinish / 2)), targetPage: Math.floor(totalPages / 2), tip: "You're halfway through! Notice how the themes are weaving together." },
      { day: daysToFinish, targetPage: totalPages, tip: "Congratulations on reaching the finale! Take a moment to log your review." },
    ],
  });
}

/** Streaming variant for the chat endpoint (SSE). Caller iterates the async generator. */
export async function* streamChatWithAssistant(history: ChatMessage[]) {
  const system = "You are BookBuddy AI, a friendly, context-aware reading companion. Keep answers concise and warm. Recommend specific real books when relevant.";
  try {
    if (genaiClient) {
      const contents = history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const streamResult = await genaiClient.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction: system, maxOutputTokens: 800 },
      });
      for await (const chunk of streamResult) {
        if (chunk.text) yield chunk.text;
      }
      return;
    } else if (anthropicClient) {
      const stream = anthropicClient.messages.stream({
        model: env.anthropic.model,
        max_tokens: 800,
        system,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
      return;
    }
  } catch (err: any) {
    console.warn("[ai] streaming failed:", err.message);
  }
  yield "I'd love to help you find your next great book! What kind of genres or themes are you currently feeling in the mood for?";
}
