import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface DareResult {
  dare: string;
  difficulty: "easy" | "medium" | "hard";
  embarrassment_level: number;
  duck_taunt: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const start = Date.now();
  const result = await generateJSON<DareResult>(PROMPTS.dare());

  await auditLog(ip, "/api/v1/dare", null, result, Date.now() - start);

  return Response.json(result);
}
