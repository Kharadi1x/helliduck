import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface JudgeResult {
  winner: "A" | "B" | "neither";
  verdict: string;
  roast_a: string;
  roast_b: string;
  confidence: number;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const body = await request.json();
  const { sideA, sideB } = body;

  if (!sideA || !sideB) {
    return Response.json({ error: "Both sides of the argument are required" }, { status: 400 });
  }

  const start = Date.now();
  const result = await generateJSON<JudgeResult>(
    PROMPTS.judge(String(sideA).slice(0, 500), String(sideB).slice(0, 500))
  );

  auditLog(ip, "/api/v1/judge", { sideA, sideB }, result, Date.now() - start);

  return Response.json(result);
}
