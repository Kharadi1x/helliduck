import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface MemeResult {
  top_text: string;
  bottom_text: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const body = await request.json();
  const { template, context } = body;

  if (!template || typeof template !== "string") {
    return Response.json({ error: "Please select a meme template" }, { status: 400 });
  }

  const start = Date.now();
  const result = await generateJSON<MemeResult>(
    PROMPTS.meme(template.slice(0, 100), context?.slice(0, 200))
  );

  auditLog(ip, "/api/v1/meme", { template, context }, result, Date.now() - start);

  return Response.json(result);
}
