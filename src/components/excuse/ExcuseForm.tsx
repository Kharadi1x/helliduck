"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import ResultCard from "@/components/shared/ResultCard";

interface ExcuseResult {
  excuse: string;
  believability_actual: number;
  duck_comment: string;
}

export default function ExcuseForm() {
  const [situation, setSituation] = useState("");
  const [believability, setBelievability] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExcuseResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/excuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, believability }),
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
            What do you need an excuse for?
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="e.g., I need to skip my friend's improv show..."
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">
            Believability: {believability}%
            <span className="ml-2 text-xs">
              {believability < 30
                ? "(absurd)"
                : believability < 70
                  ? "(plausible)"
                  : "(boring but safe)"}
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={believability}
            onChange={(e) => setBelievability(Number(e.target.value))}
            className="w-full accent-duck-yellow"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !situation.trim()}
          className="w-full bg-duck-yellow text-black font-semibold py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Excuse"}
        </button>
      </form>

      {loading && <LoadingDuck />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <ResultCard shareText={`My AI excuse: "${result.excuse}" — Helliduck rated it ${result.believability_actual}% believable`}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-1">Your excuse:</p>
              <p className="text-lg font-medium">&ldquo;{result.excuse}&rdquo;</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">Believability:</span>
              <div className="flex-1 bg-card-border rounded-full h-2">
                <div
                  className="bg-duck-yellow rounded-full h-2 transition-all"
                  style={{ width: `${result.believability_actual}%` }}
                />
              </div>
              <span className="text-sm font-mono text-duck-yellow">
                {result.believability_actual}%
              </span>
            </div>

            <div className="bg-duck-yellow/5 rounded-lg p-3">
              <p className="text-sm text-duck-yellow-light">
                🦆 {result.duck_comment}
              </p>
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  );
}
