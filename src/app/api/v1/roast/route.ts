import { generateJSON } from "@/lib/gemini";
import { checkRateLimit, getClientIP, rateLimitResponse } from "@/lib/rate-limit";
import { PROMPTS } from "@/lib/prompts";
import { auditLog } from "@/lib/audit";

interface RoastResult {
  design_roast: string;
  performance_roast: string;
  seo_roast: string;
  copy_roast: string;
  ducked_score: number;
  one_liner: string;
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { allowed, globalCapHit } = await checkRateLimit(ip);
  if (!allowed) return rateLimitResponse(globalCapHit);

  const body = await request.json();
  let { url } = body;

  if (!url || typeof url !== "string") {
    return Response.json({ error: "Please provide a URL" }, { status: 400 });
  }

  // Normalize URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Fetch the website
  let html: string;
  let loadTime: number;
  try {
    const start = Date.now();
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Helliduck-Roaster/1.0 (https://helliduck.com)",
      },
      signal: AbortSignal.timeout(10000),
    });
    loadTime = Date.now() - start;

    if (!res.ok) {
      return Response.json(
        { error: `Website returned ${res.status}. Can't roast what we can't reach.` },
        { status: 400 }
      );
    }

    html = await res.text();
  } catch {
    return Response.json(
      { error: "Couldn't fetch that website. It might be blocking us, or it's just that bad." },
      { status: 400 }
    );
  }

  // Extract basic metrics
  const metrics = analyzeHTML(html, loadTime);

  const start = Date.now();
  const result = await generateJSON<RoastResult>(PROMPTS.roast(url, html, metrics));

  auditLog(ip, "/api/v1/roast", { url }, { ...result, metrics }, Date.now() - start);

  return Response.json({ ...result, metrics });
}

function analyzeHTML(html: string, loadTimeMs: number) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const imgCount = (html.match(/<img[\s>]/gi) || []).length;
  const imgWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
  const scriptCount = (html.match(/<script[\s>]/gi) || []).length;
  const hasViewport = /<meta[^>]*viewport/i.test(html);
  const hasFavicon = /<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(html);
  const htmlSize = Math.round(html.length / 1024);

  return {
    title: titleMatch?.[1] || "(none)",
    metaDescription: metaDescMatch?.[1]?.slice(0, 100) || "(none)",
    h1Count,
    h2Count,
    imgCount,
    imgWithoutAlt,
    scriptCount,
    hasViewport,
    hasFavicon,
    htmlSizeKB: htmlSize,
    loadTimeMs,
  };
}
