import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;

/**
 * Hash password securely with bcryptjs
 */
export async function hashPassword(password: string, saltRounds = DEFAULT_SALT_ROUNDS): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against stored hash
 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Generate random token string (for email verification, reset tokens)
 */
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
