"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import ResultCard from "@/components/shared/ResultCard";

interface RateResult {
  ratings: {
    boldness: number;
    financial_sense: number;
    happiness_potential: number;
    parent_approval: number;
  };
  overall_score: number;
  summary: string;
  duck_advice: string;
}

const ratingLabels: Record<string, { label: string; emoji: string }> = {
  boldness: { label: "Boldness", emoji: "💪" },
  financial_sense: { label: "Financial Sense", emoji: "💰" },
  happiness_potential: { label: "Happiness Potential", emoji: "😊" },
  parent_approval: { label: "Parent Approval", emoji: "👨‍👩‍👧" },
};

export default function RateForm() {
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RateResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!decision.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
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
            Describe your life choice:
          </label>
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g., I quit my stable job to become a professional yo-yo player..."
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !decision.trim()}
          className="w-full bg-duck-yellow text-black font-semibold py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Rating..." : "Rate My Choice"}
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
          shareText={`The duck rated my life choice ${result.overall_score}/10. "${result.summary}"`}
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-duck-yellow">
                {result.overall_score}/10
              </p>
              <p className="text-xs text-muted mt-1">Overall Score</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.ratings).map(([key, value]) => {
                const info = ratingLabels[key];
                return (
                  <div key={key} className="bg-card-bg border border-card-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{info?.emoji}</span>
                      <span className="text-xs text-muted">{info?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-card-border rounded-full h-1.5">
                        <div
                          className="bg-duck-yellow rounded-full h-1.5 transition-all"
                          style={{ width: `${value * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center">{result.summary}</p>

            <div className="bg-duck-yellow/5 rounded-lg p-3">
              <p className="text-sm text-duck-yellow-light">
                🦆 {result.duck_advice}
              </p>
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  );
}
