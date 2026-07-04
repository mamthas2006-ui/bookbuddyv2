import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Authentication & Validation API Tests", () => {
  it("POST /api/v1/auth/register should fail validation when email is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "SecretPassword123!",
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Validation failed");
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((e: any) => e.field === "body.email")).toBe(true);
  });

  it("POST /api/v1/auth/register should fail validation when password lacks number or uppercase", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "valid@bookbuddy.ai",
        password: "weakpassword",
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("POST /api/v1/auth/login should reject non-existent user or wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "nonexistent-user@bookbuddy.ai",
        password: "SecretPassword123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid email or password");
  });
});
