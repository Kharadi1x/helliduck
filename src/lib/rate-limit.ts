const rateMap = new Map<string, { count: number; resetAt: number }>();

const FREE_LIMIT = 10; // requests per day
const DAY_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + DAY_MS });
    return { allowed: true, remaining: FREE_LIMIT - 1 };
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: FREE_LIMIT - entry.count };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export function rateLimitResponse() {
  return Response.json(
    {
      error: "Rate limit exceeded",
      message: "You've used all 10 free requests today. Come back tomorrow, or get an API key for more! 🦆",
    },
    { status: 429 }
  );
}
