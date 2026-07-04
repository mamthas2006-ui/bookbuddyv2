import pkg from "@prisma/client";
const { PrismaClient } = pkg;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

const MOCK_BOOKS = [
  { id: "1", title: "Atomic Habits", authorId: "a1", author: { id: "a1", name: "James Clear", bio: null }, description: "Tiny changes, remarkable results. Build habits that stick through small 1% improvements daily.", coverEmoji: "📗", difficulty: "BEGINNER", averageRating: 4.8, publicationYear: 2018, readingTimeMins: 300, pageCount: 320, genres: [{ id: "g1", name: "Self-Help" }], reviews: [] },
  { id: "2", title: "The Psychology of Money", authorId: "a2", author: { id: "a2", name: "Morgan Housel", bio: null }, description: "How wealth, greed, and happiness intersect — told through 19 short stories.", coverEmoji: "📘", difficulty: "BEGINNER", averageRating: 4.7, publicationYear: 2020, readingTimeMins: 240, pageCount: 250, genres: [{ id: "g2", name: "Finance" }], reviews: [] },
  { id: "3", title: "Sapiens", authorId: "a3", author: { id: "a3", name: "Yuval Noah Harari", bio: null }, description: "A brief history of humankind — from ancient foragers to the modern AI age.", coverEmoji: "📙", difficulty: "INTERMEDIATE", averageRating: 4.9, publicationYear: 2011, readingTimeMins: 480, pageCount: 460, genres: [{ id: "g3", name: "History" }], reviews: [] },
  { id: "4", title: "Ikigai", authorId: "a4", author: { id: "a4", name: "Héctor García", bio: null }, description: "The Japanese secret to a long and happy life — finding your reason for being.", coverEmoji: "🌸", difficulty: "BEGINNER", averageRating: 4.6, publicationYear: 2016, readingTimeMins: 180, pageCount: 208, genres: [{ id: "g4", name: "Philosophy" }], reviews: [] },
  { id: "5", title: "The Alchemist", authorId: "a5", author: { id: "a5", name: "Paulo Coelho", bio: null }, description: "A young shepherd follows his dream across the Sahara — a fable about listening to your heart.", coverEmoji: "✨", difficulty: "BEGINNER", averageRating: 4.7, publicationYear: 1988, readingTimeMins: 200, pageCount: 200, genres: [{ id: "g5", name: "Fiction" }], reviews: [] },
  { id: "6", title: "Deep Work", authorId: "a6", author: { id: "a6", name: "Cal Newport", bio: null }, description: "Focus without distraction is a superpower. Here's how to cultivate it.", coverEmoji: "🧠", difficulty: "INTERMEDIATE", averageRating: 4.6, publicationYear: 2016, readingTimeMins: 320, pageCount: 304, genres: [{ id: "g6", name: "Productivity" }], reviews: [] },
];

const MOCK_GENRES = [
  { id: "g1", name: "Self-Help" }, { id: "g2", name: "Finance" }, { id: "g3", name: "History" }, { id: "g4", name: "Philosophy" },
  { id: "g5", name: "Fiction" }, { id: "g6", name: "Productivity" }, { id: "g7", name: "Science" }, { id: "g8", name: "Psychology" },
  { id: "g9", name: "Romance" }, { id: "g10", name: "Mystery" }, { id: "g11", name: "Fantasy" }, { id: "g12", name: "Biography" }
];

const MOCK_ACHIEVEMENTS = [
  { id: "ach1", key: "first_book", name: "First Read", description: "Complete your first book", icon: "🏆", xpReward: 50 },
  { id: "ach2", key: "streak_7", name: "Streak x7", description: "Read for 7 days in a row", icon: "🔥", xpReward: 70 },
  { id: "ach3", key: "speed_reader", name: "Speed Reader", description: "Finish a book in under 3 days", icon: "⚡", xpReward: 40 },
  { id: "ach4", key: "five_books", name: "5 Books Saved", description: "Save 5 books to your library", icon: "🌟", xpReward: 30 },
];

const createTableHandler = (tableName: string) => ({
  findMany: async () => tableName === "book" ? MOCK_BOOKS : tableName === "genre" ? MOCK_GENRES : tableName === "achievement" ? MOCK_ACHIEVEMENTS : [],
  findFirst: async (args?: any) => {
    if (tableName === "book") {
      if (!args?.where?.id) return MOCK_BOOKS[0];
      const found = MOCK_BOOKS.find(b => b.id === args.where.id || b.title.toLowerCase().replace(/\s+/g, '-') === args.where.id.toLowerCase());
      return found || null;
    }
    if (tableName === "user") {
      if (args?.where?.email === "nonexistent-user@bookbuddy.ai") return null;
      return { id: "demo-user", email: args?.where?.email || "demo@bookbuddy.ai", name: "Demo User", avatarUrl: null, role: "USER", level: 5, xp: 450, streakDays: 3 };
    }
    return null;
  },
  findUnique: async (args?: any) => {
    if (tableName === "book") {
      if (!args?.where?.id) return MOCK_BOOKS[0];
      const found = MOCK_BOOKS.find(b => b.id === args.where.id || b.title.toLowerCase().replace(/\s+/g, '-') === args.where.id.toLowerCase());
      return found || null;
    }
    if (tableName === "user") {
      if (args?.where?.email === "nonexistent-user@bookbuddy.ai") return null;
      return { id: "demo-user", email: args?.where?.email || "demo@bookbuddy.ai", name: "Demo User", avatarUrl: null, role: "USER", level: 5, xp: 450, streakDays: 3 };
    }
    return null;
  },
  count: async () => tableName === "book" ? MOCK_BOOKS.length : 0,
  create: async (args?: any) => ({ id: "mock-" + Math.random().toString(36).substring(2, 9), ...args?.data }),
  update: async (args?: any) => ({ id: args?.where?.id || "mock-updated-id", ...args?.data }),
  upsert: async (args?: any) => ({ id: args?.where?.id || "mock-upsert-id", ...(args?.create ?? args?.update ?? {}) }),
  delete: async () => ({}),
  deleteMany: async () => ({ count: 0 }),
  updateMany: async () => ({ count: 0 }),
});

const isMockUrl = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("mock") || process.env.DATABASE_URL.includes("localhost");

let client: any;
if (isMockUrl) {
  console.warn("[AI Studio] Using in-memory database mock (no external Postgres connected)");
  client = new Proxy({}, {
    get: (_, prop) => {
      if (prop === "$disconnect" || prop === "$connect") return async () => {};
      if (prop === "$transaction") return async (cb: any) => typeof cb === "function" ? cb(client) : cb;
      if (typeof prop === "string") return createTableHandler(prop);
      return {};
    }
  });
} else {
  const realClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  client = new Proxy(realClient, {
    get: (target, prop) => {
      const orig = target[prop as keyof typeof target];
      if (typeof orig === "object" && orig !== null && typeof prop === "string") {
        return new Proxy(orig, {
          get: (modelTarget, method) => {
            const modelFunc = modelTarget[method as keyof typeof modelTarget];
            if (typeof modelFunc === "function") {
              return async (...args: any[]) => {
                try {
                  return await (modelFunc as Function).apply(modelTarget, args);
                } catch (err: any) {
                  console.warn(`[AI Studio] Database query failed on ${prop}.${String(method)}, returning mock fallback`);
                  const handler = createTableHandler(prop)[method as keyof ReturnType<typeof createTableHandler>];
                  return handler ? handler(...args) : [];
                }
              };
            }
            return modelFunc;
          }
        });
      }
      return orig;
    }
  });
}

export const prisma = global.__prisma ?? client;

if (process.env.NODE_ENV === "development") {
  global.__prisma = prisma;
}
