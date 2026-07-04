import { BooksRepository } from "../repositories/books.repository";
import { CacheService, cached } from "../cache";
import { BookFilterQuery } from "../types";
import { CreateBookInput, UpdateBookInput } from "../validation/books.validation";
import { AppError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { CACHE_KEYS, CACHE_TTL } from "../constants";

const booksRepo = new BooksRepository();

export class BooksService {
  async listBooks(query: BookFilterQuery) {
    const cacheKey = CACHE_KEYS.BOOKS_LIST(JSON.stringify(query));
    return cached(cacheKey, CACHE_TTL.SHORT, async () => {
      return booksRepo.findPaginated(query);
    });
  }

  async getBookById(id: string) {
    const book = await booksRepo.findById(id);
    if (!book) {
      throw new AppError("Book not found", 404);
    }
    return book;
  }

  async getSimilarBooks(id: string) {
    const book = await this.getBookById(id);
    const genreIds = book.genres.map((g) => g.id);
    return booksRepo.findSimilar(id, genreIds);
  }

  async createBook(input: CreateBookInput) {
    const book = await booksRepo.createBook(input);
    await CacheService.invalidateBooksList();
    logger.info({ bookId: book.id, title: book.title }, "New book created in library");
    return book;
  }

  async updateBook(id: string, input: UpdateBookInput) {
    await this.getBookById(id); // ensures existence
    const updated = await booksRepo.updateBook(id, input);
    await CacheService.invalidateBooksList();
    logger.info({ bookId: id }, "Book updated");
    return updated;
  }

  async deleteBook(id: string) {
    await this.getBookById(id);
    await booksRepo.softDelete(id);
    await CacheService.invalidateBooksList();
    logger.info({ bookId: id }, "Book soft-deleted");
  }

  async getTrendingBooks(limit = 10) {
    return cached(CACHE_KEYS.BOOKS_TRENDING, CACHE_TTL.LONG, async () => {
      return booksRepo.findTrending(limit);
    });
  }
}
