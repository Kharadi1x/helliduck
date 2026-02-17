import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — Helliduck",
  description: "Free API for excuse generation, fortune cookies, argument judging, and more.",
};

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/excuse",
    description: "Generate an AI-crafted excuse",
    body: `{ "situation": "string", "believability": 0-100 }`,
    response: `{ "excuse": "...", "believability_actual": 75, "duck_comment": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/fortune",
    description: "Get a brutally honest fortune",
    body: `{}`,
    response: `{ "fortune": "...", "lucky_numbers": [1,2,3,4,5,6], "duck_wisdom": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/judge",
    description: "Settle an argument",
    body: `{ "sideA": "string", "sideB": "string" }`,
    response: `{ "winner": "A|B|neither", "verdict": "...", "roast_a": "...", "roast_b": "...", "confidence": 85 }`,
  },
  {
    method: "POST",
    path: "/api/v1/rate",
    description: "Rate a life decision",
    body: `{ "decision": "string" }`,
    response: `{ "ratings": { "boldness": 8, ... }, "overall_score": 7, "summary": "...", "duck_advice": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/dare",
    description: "Get a random dare",
    body: `{}`,
    response: `{ "dare": "...", "difficulty": "easy|medium|hard", "embarrassment_level": 7, "duck_taunt": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/roast",
    description: "Roast a website",
    body: `{ "url": "https://example.com" }`,
    response: `{ "design_roast": "...", "performance_roast": "...", "seo_roast": "...", "copy_roast": "...", "ducked_score": 45, "one_liner": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/meme",
    description: "Generate meme captions",
    body: `{ "template": "Drake Hotline Bling", "context": "optional topic" }`,
    response: `{ "top_text": "...", "bottom_text": "..." }`,
  },
  {
    method: "POST",
    path: "/api/v1/clapback",
    description: "Get a comeback for a roast you received",
    body: `{ "roast": "the roast someone sent you" }`,
    response: `{ "clapback": "...", "mic_drop": "...", "alternatives": ["...", "..."], "savageness": 8, "duck_commentary": "..." }`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-5xl mb-4 block">🔌</span>
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted text-sm">
          Use Helliduck&apos;s AI features in your own apps. Free tier: 100
          calls/month.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <p className="text-sm text-muted mb-3">
            Include your API key in the <code className="text-duck-yellow">x-api-key</code> header:
          </p>
          <pre className="bg-black/50 rounded-lg p-3 text-sm overflow-x-auto">
            <code>{`curl -X POST https://helliduck.com/api/v1/fortune \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{}'`}</code>
          </pre>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-semibold">Rate Limits</h2>
        <div className="bg-card-bg border border-card-border rounded-xl p-4 text-sm text-muted">
          <ul className="space-y-1">
            <li><strong className="text-foreground">Website:</strong> 10 free uses per day (no API key needed)</li>
            <li><strong className="text-foreground">API Free Tier:</strong> 100 calls per month per API key</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Endpoints</h2>

        {endpoints.map((ep) => (
          <div
            key={ep.path}
            className="bg-card-bg border border-card-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-card-border">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                {ep.method}
              </span>
              <code className="text-sm font-mono text-duck-yellow">{ep.path}</code>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted">{ep.description}</p>

              <div>
                <p className="text-xs text-muted mb-1">Request body:</p>
                <pre className="bg-black/50 rounded-lg p-2 text-xs overflow-x-auto">
                  <code>{ep.body}</code>
                </pre>
              </div>

              <div>
                <p className="text-xs text-muted mb-1">Response:</p>
                <pre className="bg-black/50 rounded-lg p-2 text-xs overflow-x-auto">
                  <code>{ep.response}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 text-sm text-muted">
        <p>
          Want an API key? Email{" "}
          <span className="text-duck-yellow">hello@helliduck.com</span> (or
          just use the website for free).
        </p>
      </div>
    </div>
  );
}
