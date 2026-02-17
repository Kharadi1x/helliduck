"use client";

import { useState } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";
import ResultCard from "@/components/shared/ResultCard";

interface FortuneResult {
  fortune: string;
  lucky_numbers: number[];
  duck_wisdom: string;
}

export default function FortuneCookie() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [error, setError] = useState("");
  const [cracked, setCracked] = useState(false);

  async function crackCookie() {
    setCracked(true);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/v1/fortune", {
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

  function reset() {
    setCracked(false);
    setResult(null);
    setError("");
  }

  return (
    <div className="space-y-6">
      {!cracked ? (
        <div className="text-center py-12">
          <button
            onClick={crackCookie}
            className="group text-8xl hover:animate-quack transition-transform cursor-pointer"
            aria-label="Crack the fortune cookie"
          >
            🥠
          </button>
          <p className="text-muted mt-4 text-sm">Click the cookie. If you dare.</p>
        </div>
      ) : (
        <>
          {loading && <LoadingDuck />}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <ResultCard shareText={`My fortune: "${result.fortune}" — via Helliduck's brutally honest fortune cookies`}>
              <div className="space-y-4 text-center">
                <p className="text-2xl font-bold leading-relaxed">
                  &ldquo;{result.fortune}&rdquo;
                </p>

                <div className="flex justify-center gap-2">
                  {result.lucky_numbers.map((n, i) => (
                    <span
                      key={i}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-duck-yellow/10 text-duck-yellow text-xs font-mono"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="bg-duck-yellow/5 rounded-lg p-3">
                  <p className="text-sm text-duck-yellow-light">
                    🦆 {result.duck_wisdom}
                  </p>
                </div>
              </div>
            </ResultCard>
          )}

          {(result || error) && (
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:border-duck-yellow/50 transition-colors"
            >
              Crack Another Cookie
            </button>
          )}
        </>
      )}
    </div>
  );
}
