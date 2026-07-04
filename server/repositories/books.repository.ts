import { prisma } from "../config/prisma";
import { BookFilterQuery } from "../types";
import { getPaginationArgs } from "../helpers";
import { CreateBookInput, UpdateBookInput } from "../validation/books.validation";

export class BooksRepository {
  async findPaginated(query: BookFilterQuery) {
    const { skip, take, page, limit } = getPaginationArgs(query);
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (query.genre) where.genres = { some: { name: query.genre } };
    if (query.author) where.author = { name: { contains: query.author, mode: "insensitive" } };
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.language) where.language = query.language;
    if (query.minRating) where.averageRating = { gte: Number(query.minRating) };
    if (query.year) where.publicationYear = Number(query.year);
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (query.sort === "newest") orderBy.createdAt = "desc";
    else if (query.sort === "title") orderBy.title = "asc";
    else orderBy.averageRating = "desc";

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { author: true, genres: true },
        orderBy,
        skip,
        take,
      }),
      prisma.book.count({ where }),
    ]);

    return { books, total, page, limit };
  }

  async findById(id: string) {
    return prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: true,
        publisher: true,
        genres: true,
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findSimilar(bookId: string, genreIds: string[]) {
    return prisma.book.findMany({
      where: {
        id: { not: bookId },
        deletedAt: null,
        genres: { some: { id: { in: genreIds } } },
      },
      include: { author: true },
      take: 6,
      orderBy: { averageRating: "desc" },
    });
  }

  async createBook(data: CreateBookInput) {
    const author = await prisma.author.upsert({
      where: { name: data.authorName },
      update: {},
      create: { name: data.authorName },
    });

    const publisher = data.publisherName
      ? await prisma.publisher.upsert({
          where: { name: data.publisherName },
          update: {},
          create: { name: data.publisherName },
        })
      : null;

    return prisma.book.create({
      data: {
        title: data.title,
        authorId: author.id,
        publisherId: publisher?.id,
        description: data.description,
        difficulty: data.difficulty || "BEGINNER",
        language: data.language || "English",
        publicationYear: data.publicationYear,
        pageCount: data.pageCount,
        readingTimeMins: data.readingTimeMins,
        coverEmoji: data.coverEmoji || "📚",
        coverUrl: data.coverUrl,
        isbn: data.isbn,
        genres: {
          connectOrCreate: (data.genres || []).map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { author: true, genres: true },
    });
  }

  async updateBook(id: string, data: UpdateBookInput) {
    return prisma.book.update({
      where: { id },
      data,
      include: { author: true, genres: true },
    });
  }

  async softDelete(id: string) {
    return prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findTrending(limit = 10) {
    return prisma.book.findMany({
      where: { difficulty: "BEGINNER", deletedAt: null },
      include: { author: true },
      orderBy: { averageRating: "desc" },
      take: limit,
    });
  }
}
