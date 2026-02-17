import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface ClapbackResult {
  clapback: string;
  mic_drop: string;
  alternatives: string[];
  savageness: number;
  duck_commentary: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const body = await request.json();
  const { roast } = body;

  if (!roast || typeof roast !== "string") {
    return Response.json({ error: "Please provide the roast you received" }, { status: 400 });
  }

  const start = Date.now();
  const result = await generateJSON<ClapbackResult>(
    PROMPTS.clapback(roast.slice(0, 1000))
  );

  auditLog(ip, "/api/v1/clapback", { roast }, result, Date.now() - start);

  return Response.json(result);
}
