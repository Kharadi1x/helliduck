// API key validation for the public API
// Uses Upstash Redis for persistent usage tracking in production,
// falls back to in-memory for local dev.

import { Redis } from "@upstash/redis";

const API_KEYS = new Set(
  (process.env.API_KEYS || "").split(",").filter(Boolean)
);

const MONTHLY_LIMIT = 100;
const MONTH_SECONDS = 31 * 24 * 60 * 60; // 31 days TTL

// --- Upstash Redis ---
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// --- In-memory fallback ---
const memUsage = new Map<string, { count: number; resetAt: number }>();
const MONTH_MS = MONTH_SECONDS * 1000;

function checkMemoryUsage(apiKey: string): { withinLimit: boolean; count: number } {
  const now = Date.now();
  const usage = memUsage.get(apiKey);

  if (!usage || now > usage.resetAt) {
    memUsage.set(apiKey, { count: 1, resetAt: now + MONTH_MS });
    return { withinLimit: true, count: 1 };
  }

  if (usage.count >= MONTHLY_LIMIT) {
    return { withinLimit: false, count: usage.count };
  }

  usage.count++;
  return { withinLimit: true, count: usage.count };
}

// --- Main exports ---
export async function validateApiKey(request: Request): Promise<{
  valid: boolean;
  key?: string;
  error?: string;
}> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { valid: false, error: "Missing x-api-key header" };
  }

  if (!API_KEYS.has(apiKey)) {
    return { valid: false, error: "Invalid API key" };
  }

  // Check usage
  const redis = getRedis();

  if (!redis) {
    const { withinLimit } = checkMemoryUsage(apiKey);
    if (!withinLimit) {
      return { valid: false, error: "Monthly API limit exceeded (100 calls/month)" };
    }
    return { valid: true, key: apiKey };
  }

  // Redis-backed usage tracking
  const month = monthKey();
  const redisKey = `api:${apiKey}:${month}`;

  const count = (await redis.get<number>(redisKey)) ?? 0;
  if (count >= MONTHLY_LIMIT) {
    return { valid: false, error: "Monthly API limit exceeded (100 calls/month)" };
  }

  const pipe = redis.pipeline();
  pipe.incr(redisKey);
  pipe.expire(redisKey, MONTH_SECONDS);
  await pipe.exec();

  return { valid: true, key: apiKey };
}

export function isApiRequest(request: Request): boolean {
  return request.headers.has("x-api-key");
}
