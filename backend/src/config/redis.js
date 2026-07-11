import Redis from "ioredis";
import { env } from "./env.js";

let redis = null;

export function getRedis() {
  if (redis) return redis;

  if (!env.redisUrl) {
    // Return a mock redis client for development without Redis
    console.log("⚠️  Redis not configured. Using in-memory fallback for sessions/cache.");
    const store = new Map();
    redis = {
      get: async (key) => store.get(key) || null,
      set: async (key, value, ...args) => {
        store.set(key, value);
        // Handle EX (expiry in seconds)
        const exIdx = args.indexOf("EX");
        if (exIdx !== -1 && args[exIdx + 1]) {
          const ttlMs = Number(args[exIdx + 1]) * 1000;
          setTimeout(() => store.delete(key), ttlMs);
        }
        return "OK";
      },
      del: async (...keys) => {
        keys.forEach((k) => store.delete(k));
        return keys.length;
      },
      keys: async (pattern) => {
        const prefix = pattern.replace("*", "");
        return [...store.keys()].filter((k) => k.startsWith(prefix));
      },
      flushdb: async () => { store.clear(); return "OK"; },
      quit: async () => "OK",
      _isMock: true
    };
    return redis;
  }

  redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("error", (err) => console.error("Redis error:", err.message));

  redis.connect().catch((err) => {
    console.warn("Could not connect to Redis:", err.message);
  });

  return redis;
}
