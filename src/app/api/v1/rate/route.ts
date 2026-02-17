import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface RateResult {
  ratings: {
    boldness: number;
    financial_sense: number;
    happiness_potential: number;
    parent_approval: number;
  };
  overall_score: number;
  summary: string;
  duck_advice: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const body = await request.json();
  const { decision } = body;

  if (!decision || typeof decision !== "string") {
    return Response.json({ error: "Please describe your decision" }, { status: 400 });
  }

  const start = Date.now();
  const result = await generateJSON<RateResult>(PROMPTS.rate(decision.slice(0, 500)));

  await auditLog(ip, "/api/v1/rate", { decision }, result, Date.now() - start);

  return Response.json(result);
}
