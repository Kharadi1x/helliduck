import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

interface DareResult {
  dare: string;
  difficulty: "easy" | "medium" | "hard";
  embarrassment_level: number;
  duck_taunt: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const result = await generateJSON<DareResult>(PROMPTS.dare());

  return Response.json(result);
}
