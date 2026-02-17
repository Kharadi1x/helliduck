import { Redis } from "@upstash/redis";

const FREE_LIMIT = 10; // requests per day per IP
const GLOBAL_DAILY_CAP = 500; // total AI requests per day
const DAY_SECONDS = 86400;

// --- Upstash Redis (production) ---
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// --- In-memory fallback (local dev) ---
const memMap = new Map<string, { count: number; resetAt: number }>();
const DAY_MS = DAY_SECONDS * 1000;

function checkMemory(ip: string): { allowed: boolean; remaining: number; globalCapHit?: boolean } {
  const now = Date.now();

  // Global cap
  const globalEntry = memMap.get("__global__");
  if (globalEntry && now <= globalEntry.resetAt && globalEntry.count >= GLOBAL_DAILY_CAP) {
    return { allowed: false, remaining: 0, globalCapHit: true };
  }

  // Per-IP
  const entry = memMap.get(ip);
  if (!entry || now > entry.resetAt) {
    memMap.set(ip, { count: 1, resetAt: now + DAY_MS });
    bumpGlobal(now);
    return { allowed: true, remaining: FREE_LIMIT - 1 };
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  bumpGlobal(now);
  return { allowed: true, remaining: FREE_LIMIT - entry.count };
}

function bumpGlobal(now: number) {
  const g = memMap.get("__global__");
  if (!g || now > g.resetAt) {
    memMap.set("__global__", { count: 1, resetAt: now + DAY_MS });
  } else {
    g.count++;
  }
}

// --- Main export ---
export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; globalCapHit?: boolean }> {
  const redis = getRedis();
  if (!redis) return checkMemory(ip);

  const day = todayKey();
  const globalKey = `rl:global:${day}`;
  const ipKey = `rl:${ip}:${day}`;

  // Check global cap first
  const globalCount = (await redis.get<number>(globalKey)) ?? 0;
  if (globalCount >= GLOBAL_DAILY_CAP) {
    return { allowed: false, remaining: 0, globalCapHit: true };
  }

  // Check per-IP limit
  const ipCount = (await redis.get<number>(ipKey)) ?? 0;
  if (ipCount >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment both counters atomically via pipeline
  const pipe = redis.pipeline();
  pipe.incr(ipKey);
  pipe.expire(ipKey, DAY_SECONDS);
  pipe.incr(globalKey);
  pipe.expire(globalKey, DAY_SECONDS);
  await pipe.exec();

  return { allowed: true, remaining: FREE_LIMIT - ipCount - 1 };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export function rateLimitResponse(globalCapHit?: boolean) {
  if (globalCapHit) {
    return Response.json(
      {
        error: "Global limit reached",
        message:
          "HelliDuck has handled too many requests today. Try again tomorrow! 🦆",
      },
      { status: 429 }
    );
  }

  return Response.json(
    {
      error: "Rate limit exceeded",
      message:
        "You've used all 10 free requests today. Come back tomorrow, or get an API key for more! 🦆",
    },
    { status: 429 }
  );
}
