import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

interface ExcuseResult {
  excuse: string;
  believability_actual: number;
  duck_comment: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const { situation, believability } = body;

  if (!situation || typeof situation !== "string") {
    return Response.json({ error: "Please provide a situation" }, { status: 400 });
  }

  const result = await generateJSON<ExcuseResult>(
    PROMPTS.excuse(situation.slice(0, 500), Math.min(100, Math.max(0, believability ?? 50)))
  );

  return Response.json(result);
}
