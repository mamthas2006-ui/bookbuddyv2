import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../utils/hash";
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

describe("Utility Functions Unit Tests", () => {
  describe("Password Hashing (bcryptjs)", () => {
    it("should securely hash password and verify matching hash", async () => {
      const plain = "EnterpriseSecurePassword123!";
      const hash = await hashPassword(plain);
      expect(hash).not.toBe(plain);
      expect(hash.length).toBeGreaterThan(20);

      const isMatch = await comparePassword(plain, hash);
      expect(isMatch).toBe(true);

      const isNotMatch = await comparePassword("WrongPassword123!", hash);
      expect(isNotMatch).toBe(false);
    });
  });

  describe("JSON Web Tokens (JWT)", () => {
    it("should sign and verify access token with correct payload", () => {
      const payload = { id: "user-123", email: "test@bookbuddy.ai", role: "USER" as const };
      const token = signAccessToken(payload);
      expect(typeof token).toBe("string");

      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("should issue and verify refresh token with correct expiry", () => {
      const token = signRefreshToken({ id: "user-456" });
      expect(typeof token).toBe("string");

      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe("user-456");
    });
  });
});

