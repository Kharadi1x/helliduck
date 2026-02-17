"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import ResultCard from "@/components/shared/ResultCard";

interface DareResult {
  dare: string;
  difficulty: "easy" | "medium" | "hard";
  embarrassment_level: number;
  duck_taunt: string;
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  hard: "bg-red-500/10 text-red-400",
};

export default function DareCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DareResult | null>(null);
  const [error, setError] = useState("");
  const [chickened, setChickened] = useState(false);

  async function getDare() {
    setLoading(true);
    setError("");
    setResult(null);
    setChickened(false);

    try {
      const res = await fetch("/api/v1/dare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
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
      {!result && !loading && (
        <div className="text-center py-8">
          <button
            onClick={getDare}
            className="bg-duck-yellow text-black font-semibold px-8 py-4 rounded-xl text-lg hover:bg-duck-yellow-dark transition-colors"
          >
            Give Me a Dare
          </button>
        </div>
      )}

      {loading && <LoadingDuck />}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <>
          <ResultCard shareText={`I was dared to: "${result.dare}" (Embarrassment: ${result.embarrassment_level}/10)`}>
            <div className="space-y-4 text-center">
              <div className="flex justify-center gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${difficultyColors[result.difficulty]}`}
                >
                  {result.difficulty}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-card-border text-muted">
                  Embarrassment: {result.embarrassment_level}/10
                </span>
              </div>

              <p className="text-xl font-bold">{result.dare}</p>

              {chickened && (
                <div className="bg-duck-yellow/5 rounded-lg p-3">
                  <p className="text-sm text-duck-yellow-light">
                    🦆 {result.duck_taunt}
                  </p>
                </div>
              )}
            </div>
          </ResultCard>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => { setResult(null); }}
              className="py-3 rounded-xl bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 transition-colors text-sm"
            >
              I Did It!
            </button>
            <button
              onClick={() => setChickened(true)}
              className="py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors text-sm"
            >
              I&apos;m Scared
            </button>
            <button
              onClick={getDare}
              className="py-3 rounded-xl border border-card-border text-muted font-medium hover:border-duck-yellow/50 hover:text-foreground transition-colors text-sm"
            >
              New Dare
            </button>
          </div>
        </>
      )}
    </div>
  );
}
