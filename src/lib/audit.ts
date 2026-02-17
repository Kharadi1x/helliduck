// Audit logger — stores request/response pairs in Upstash Redis
// Each entry: { ip, endpoint, input, output, timestamp }
// Key: audit:<YYYY-MM-DD>:<counter>
// TTL: 30 days
// Falls back to no-op when Redis isn't configured (local dev)

import { Redis } from "@upstash/redis";

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

interface AuditEntry {
  ip: string;
  endpoint: string;
  input: unknown;
  output: unknown;
  ts: string; // ISO timestamp
  ms: number; // response time
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function auditLog(
  ip: string,
  endpoint: string,
  input: unknown,
  output: unknown,
  durationMs: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return; // no-op in local dev

  const entry: AuditEntry = {
    ip,
    endpoint,
    input,
    output,
    ts: new Date().toISOString(),
    ms: durationMs,
  };

  const day = new Date().toISOString().slice(0, 10);
  // Use a unique key per entry: audit:<date>:<random>
  const id = Math.random().toString(36).slice(2, 10);
  const key = `audit:${day}:${id}`;

  try {
    // Truncate large outputs to save space (keep first 2KB)
    const trimmed = {
      ...entry,
      input: truncate(entry.input, 1024),
      output: truncate(entry.output, 2048),
    };
    await redis.set(key, JSON.stringify(trimmed), { ex: TTL_SECONDS });

    // Also maintain a daily counter for stats
    const counterKey = `audit:count:${day}`;
    const pipe = redis.pipeline();
    pipe.incr(counterKey);
    pipe.expire(counterKey, TTL_SECONDS);
    await pipe.exec();
  } catch {
    // Non-critical — don't break the request if logging fails
  }
}

function truncate(val: unknown, maxLen: number): unknown {
  const str = typeof val === "string" ? val : JSON.stringify(val);
  if (!str || str.length <= maxLen) return val;
  return str.slice(0, maxLen) + "...[truncated]";
}
