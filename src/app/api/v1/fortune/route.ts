import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface FortuneResult {
  fortune: string;
  lucky_numbers: number[];
  duck_wisdom: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const start = Date.now();
  const result = await generateJSON<FortuneResult>(PROMPTS.fortune());

  auditLog(ip, "/api/v1/fortune", null, result, Date.now() - start);

  return Response.json(result);
}
