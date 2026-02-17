import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

interface FortuneResult {
  fortune: string;
  lucky_numbers: number[];
  duck_wisdom: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const result = await generateJSON<FortuneResult>(PROMPTS.fortune());

  return Response.json(result);
}
