import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Books API Unit & Integration Tests", () => {
  it("GET /api/v1/books should return paginated list of books with enterprise standard format", async () => {
    const res = await request(app).get("/api/v1/books");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBeGreaterThan(0);
  });

  it("GET /api/v1/books/trending should return trending books", async () => {
    const res = await request(app).get("/api/v1/books/trending");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/v1/books/:id should return 404 for a non-existent UUID", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app).get(`/api/v1/books/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("not found");
  });
});
