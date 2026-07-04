import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { key: "first_book", name: "First Read", description: "Complete your first book", icon: "🏆", xpReward: 50 },
  { key: "streak_7", name: "Streak x7", description: "Read for 7 days in a row", icon: "🔥", xpReward: 70 },
  { key: "speed_reader", name: "Speed Reader", description: "Finish a book in under 3 days", icon: "⚡", xpReward: 40 },
  { key: "five_books", name: "5 Books Saved", description: "Save 5 books to your library", icon: "🌟", xpReward: 30 },
  { key: "goal_hit", name: "Goal Setter", description: "Complete a reading goal", icon: "🎯", xpReward: 60 },
  { key: "ten_books", name: "10 Books", description: "Complete 10 books", icon: "📚", xpReward: 150 },
  { key: "genre_master", name: "Genre Master", description: "Read books from 5 different genres", icon: "🧠", xpReward: 100 },
  { key: "elite_reader", name: "Elite Reader", description: "Reach Level 10", icon: "💎", xpReward: 200 },
];

const GENRES = ["Self-Help", "Finance", "History", "Philosophy", "Fiction", "Productivity", "Science", "Psychology", "Romance", "Mystery", "Fantasy", "Biography"];

const BOOKS = [
  { title: "Atomic Habits", author: "James Clear", coverEmoji: "📗", genre: "Self-Help", difficulty: "BEGINNER", rating: 4.8, year: 2018, description: "Tiny changes, remarkable results. Build habits that stick through small 1% improvements daily.", lessons: ["Habit loops: cue, craving, response, reward", "Identity-based habits last longer", "Environment design beats willpower"] },
  { title: "The Psychology of Money", author: "Morgan Housel", coverEmoji: "📘", genre: "Finance", difficulty: "BEGINNER", rating: 4.7, year: 2020, description: "How wealth, greed, and happiness intersect — told through 19 short stories.", lessons: ["Wealth is what you don't spend", "Long-term compounding beats short-term wins", "Enough is a superpower"] },
  { title: "Sapiens", author: "Yuval Noah Harari", coverEmoji: "📙", genre: "History", difficulty: "INTERMEDIATE", rating: 4.9, year: 2011, description: "A brief history of humankind — from ancient foragers to the modern AI age.", lessons: ["Shared myths unite societies", "Agriculture was humanity's double-edged sword", "Culture evolves faster than biology"] },
  { title: "Ikigai", author: "Héctor García", coverEmoji: "🌸", genre: "Philosophy", difficulty: "BEGINNER", rating: 4.6, year: 2016, description: "The Japanese secret to a long and happy life — finding your reason for being.", lessons: ["Purpose + passion + mission + vocation = ikigai", "Small joys accumulate into a meaningful life", "Flow state extends longevity"] },
  { title: "The Alchemist", author: "Paulo Coelho", coverEmoji: "✨", genre: "Fiction", difficulty: "BEGINNER", rating: 4.7, year: 1988, description: "A young shepherd follows his dream across the Sahara — a fable about listening to your heart.", lessons: ["Personal legends are worth pursuing", "The universe conspires for those who dream", "Omens guide us if we pay attention"] },
  { title: "Deep Work", author: "Cal Newport", coverEmoji: "🧠", genre: "Productivity", difficulty: "INTERMEDIATE", rating: 4.6, year: 2016, description: "Focus without distraction is a superpower. Here's how to cultivate it.", lessons: ["Deep work is increasingly rare and valuable", "Schedule every minute intentionally", "Quit social media or limit it drastically"] },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }
  console.log(`  ✓ ${ACHIEVEMENTS.length} achievements`);

  for (const g of GENRES) {
    await prisma.genre.upsert({ where: { name: g }, update: {}, create: { name: g } });
  }
  console.log(`  ✓ ${GENRES.length} genres`);

  for (const b of BOOKS) {
    const author = await prisma.author.upsert({ where: { name: b.author }, update: {}, create: { name: b.author } });
    await prisma.book.upsert({
      where: { isbn: `seed-${b.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        title: b.title,
        authorId: author.id,
        description: b.description,
        coverEmoji: b.coverEmoji,
        difficulty: b.difficulty as any,
        averageRating: b.rating,
        ratingCount: Math.floor(Math.random() * 5000) + 500,
        publicationYear: b.year,
        keyLessons: b.lessons,
        isbn: `seed-${b.title.toLowerCase().replace(/\s+/g, "-")}`,
        genres: { connectOrCreate: [{ where: { name: b.genre }, create: { name: b.genre } }] },
      },
    });
  }
  console.log(`  ✓ ${BOOKS.length} books`);

  // Demo admin account (change password before any real deployment)
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@bookbuddy.ai" },
    update: {},
    create: {
      email: "admin@bookbuddy.ai",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      profile: { create: {} },
    },
  });
  console.log("  ✓ demo admin account (admin@bookbuddy.ai / ChangeMe123!)");

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
