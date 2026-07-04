// MOCKED — in-memory, data lost on container sleep
const store = new Map<string, string>();

export const redis = {
  get: async (k: string) => store.get(k) ?? null,
  set: async (k: string, v: string, _ex?: string, _ttl?: number) => {
    store.set(k, v);
    return "OK";
  },
  del: async (...keys: string[]) => {
    keys.forEach((k) => store.delete(k));
    return keys.length;
  },
  keys: async (pattern: string) => {
    const prefix = pattern.replace(/\*/g, "");
    return Array.from(store.keys()).filter((k) => k.startsWith(prefix) || pattern === "*");
  },
  incr: async (k: string) => {
    const n = Number(store.get(k) || 0) + 1;
    store.set(k, String(n));
    return n;
  },
  on: (_event: string, _cb: (err?: any) => void) => {},
};

/** Cache wrapper: returns cached value or computes + stores it with a TTL (seconds). */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const hit = await redis.get(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      // ignore parse error
    }
  }
  const value = await fn();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return value;
}

export async function invalidate(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
}
