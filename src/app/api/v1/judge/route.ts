import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

interface JudgeResult {
  winner: "A" | "B" | "neither";
  verdict: string;
  roast_a: string;
  roast_b: string;
  confidence: number;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const { sideA, sideB } = body;

  if (!sideA || !sideB) {
    return Response.json({ error: "Both sides of the argument are required" }, { status: 400 });
  }

  const result = await generateJSON<JudgeResult>(
    PROMPTS.judge(String(sideA).slice(0, 500), String(sideB).slice(0, 500))
  );

  return Response.json(result);
}
