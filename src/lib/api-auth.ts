// API key validation for the public API
// MVP: keys stored in environment variable as comma-separated list
// Future: Vercel KV or database

const API_KEYS = new Set(
  (process.env.API_KEYS || "").split(",").filter(Boolean)
);

const apiUsage = new Map<string, { count: number; resetAt: number }>();
const MONTHLY_LIMIT = 100;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function validateApiKey(request: Request): {
  valid: boolean;
  key?: string;
  error?: string;
} {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { valid: false, error: "Missing x-api-key header" };
  }

  if (!API_KEYS.has(apiKey)) {
    return { valid: false, error: "Invalid API key" };
  }

  // Check usage
  const now = Date.now();
  const usage = apiUsage.get(apiKey);

  if (!usage || now > usage.resetAt) {
    apiUsage.set(apiKey, { count: 1, resetAt: now + MONTH_MS });
    return { valid: true, key: apiKey };
  }

  if (usage.count >= MONTHLY_LIMIT) {
    return { valid: false, error: "Monthly API limit exceeded (100 calls/month)" };
  }

  usage.count++;
  return { valid: true, key: apiKey };
}

export function isApiRequest(request: Request): boolean {
  return request.headers.has("x-api-key");
}
