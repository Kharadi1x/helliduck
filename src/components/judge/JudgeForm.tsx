"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import Verdict from "./Verdict";

interface JudgeResult {
  winner: "A" | "B" | "neither";
  verdict: string;
  roast_a: string;
  roast_b: string;
  confidence: number;
}

export default function JudgeForm() {
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sideA.trim() || !sideB.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sideA, sideB }),
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
            Person A says:
          </label>
          <textarea
            value={sideA}
            onChange={(e) => setSideA(e.target.value)}
            placeholder="e.g., Pineapple belongs on pizza..."
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="text-center text-2xl text-muted">VS</div>

        <div>
          <label className="block text-sm text-muted mb-2">
            Person B says:
          </label>
          <textarea
            value={sideB}
            onChange={(e) => setSideB(e.target.value)}
            placeholder="e.g., Pineapple on pizza is a crime against humanity..."
            className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !sideA.trim() || !sideB.trim()}
          className="w-full bg-duck-yellow text-black font-semibold py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Judging..." : "Settle This!"}
        </button>
      </form>

      {loading && <LoadingDuck />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && <Verdict result={result} />}
    </div>
  );
}
