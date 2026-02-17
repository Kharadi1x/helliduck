import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

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
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const { decision } = body;

  if (!decision || typeof decision !== "string") {
    return Response.json({ error: "Please describe your decision" }, { status: 400 });
  }

  const result = await generateJSON<RateResult>(PROMPTS.rate(decision.slice(0, 500)));

  return Response.json(result);
}
