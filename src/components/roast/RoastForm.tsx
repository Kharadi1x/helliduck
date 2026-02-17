"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import RoastResult from "./RoastResult";

export interface RoastData {
  design_roast: string;
  performance_roast: string;
  seo_roast: string;
  copy_roast: string;
  ducked_score: number;
  one_liner: string;
  metrics: {
    title: string;
    metaDescription: string;
    h1Count: number;
    imgCount: number;
    imgWithoutAlt: number;
    scriptCount: number;
    hasViewport: boolean;
    hasFavicon: boolean;
    htmlSizeKB: number;
    loadTimeMs: number;
  };
}

export default function RoastForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastData | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Something went wrong");
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-2">
            Enter a website URL:
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., example.com"
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-duck-yellow text-black font-semibold py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Roasting..." : "Roast This Website"}
        </button>
      </form>

      {loading && <LoadingDuck />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && <RoastResult data={result} url={url} />}
    </div>
  );
}
