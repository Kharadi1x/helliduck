"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import ResultCard from "@/components/shared/ResultCard";

interface ClapbackResult {
  clapback: string;
  mic_drop: string;
  alternatives: string[];
  savageness: number;
  duck_commentary: string;
}

export default function ClapbackForm() {
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClapbackResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roast.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/clapback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roast }),
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

  async function copyText(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-2">
            Paste the roast you received:
          </label>
          <textarea
            value={roast}
            onChange={(e) => setRoast(e.target.value)}
            placeholder='e.g., "Your code looks like it was written by a caffeinated monkey during an earthquake..."'
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 resize-none"
            rows={4}
            maxLength={1000}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !roast.trim()}
          className="w-full bg-duck-yellow text-black font-semibold py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Cooking up a comeback..." : "Get My Comeback"}
        </button>
      </form>

      {loading && <LoadingDuck />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <ResultCard
          shareText={`My comeback: "${result.mic_drop}" (Savageness: ${result.savageness}/10) — via Helliduck`}
        >
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-muted mb-1">Your comeback:</p>
            </div>

            {/* Main comeback */}
            <div
              className="bg-red-500/5 border border-red-500/10 rounded-xl p-5 relative group cursor-pointer"
              onClick={() => copyText(result.clapback, 0)}
            >
              <p className="text-lg font-medium leading-relaxed">
                {result.clapback}
              </p>
              <span className="absolute top-2 right-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {copied === 0 ? "Copied!" : "Click to copy"}
              </span>
            </div>

            {/* Mic drop */}
            <div
              className="bg-duck-yellow/5 border border-duck-yellow/10 rounded-xl p-4 text-center relative group cursor-pointer"
              onClick={() => copyText(result.mic_drop, 1)}
            >
              <p className="text-xs text-muted mb-2">Mic drop:</p>
              <p className="text-xl font-bold text-duck-yellow">
                &ldquo;{result.mic_drop}&rdquo;
              </p>
              <span className="absolute top-2 right-2 text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {copied === 1 ? "Copied!" : "Click to copy"}
              </span>
            </div>

            {/* Savageness meter */}
            <div className="flex items-center gap-3 justify-center">
              <span className="text-xs text-muted">Savageness:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      i < result.savageness
                        ? "bg-red-500"
                        : "bg-card-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-mono text-red-400">
                {result.savageness}/10
              </span>
            </div>

            {/* Alternatives */}
            {result.alternatives?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted">Quick alternatives:</p>
                {result.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="bg-card-bg border border-card-border rounded-lg p-3 flex items-center justify-between gap-3 group cursor-pointer hover:border-duck-yellow/30 transition-colors"
                    onClick={() => copyText(alt, i + 10)}
                  >
                    <p className="text-sm">{alt}</p>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {copied === i + 10 ? "Copied!" : "Copy"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Duck commentary */}
            <div className="bg-duck-yellow/5 rounded-lg p-3">
              <p className="text-sm text-duck-yellow-light">
                🦆 {result.duck_commentary}
              </p>
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  );
}
