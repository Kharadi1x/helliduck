import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";

interface MemeResult {
  top_text: string;
  bottom_text: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return rateLimitResponse();

  const body = await request.json();
  const { template, context } = body;

  if (!template || typeof template !== "string") {
    return Response.json({ error: "Please select a meme template" }, { status: 400 });
  }

  const result = await generateJSON<MemeResult>(
    PROMPTS.meme(template.slice(0, 100), context?.slice(0, 200))
  );

  return Response.json(result);
}
