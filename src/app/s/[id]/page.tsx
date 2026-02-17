"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ResultCard from "@/components/shared/ResultCard";
import Verdict from "@/components/judge/Verdict";

interface SharedResult {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export default function SharePage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/share?id=${id}`);
        if (!res.ok) throw new Error("Not found");
        setResult(await res.json());
      } catch {
        setError("This result has expired or doesn't exist.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl animate-waddle inline-block">🦆</span>
        <p className="text-muted mt-4">Loading...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🦆</span>
        <h1 className="text-2xl font-bold mb-2">Quack! Not Found</h1>
        <p className="text-muted mb-6">{error || "This result doesn't exist."}</p>
        <Link
          href="/"
          className="text-duck-yellow hover:underline"
        >
          Go back to Helliduck
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-4xl block mb-2">🦆</span>
        <p className="text-sm text-muted">Shared from Helliduck</p>
      </div>

      {result.type === "judge" && (
        <Verdict
          result={result.data as {
            winner: "A" | "B" | "neither";
            verdict: string;
            roast_a: string;
            roast_b: string;
            confidence: number;
          }}
        />
      )}

      {result.type === "excuse" && (
        <ResultCard>
          <div className="space-y-3 text-center">
            <p className="text-xs text-muted">Someone&apos;s excuse:</p>
            <p className="text-lg font-medium">&ldquo;{String(result.data.excuse)}&rdquo;</p>
            {result.data.duck_comment && (
              <div className="bg-duck-yellow/5 rounded-lg p-3">
                <p className="text-sm text-duck-yellow-light">🦆 {String(result.data.duck_comment)}</p>
              </div>
            )}
          </div>
        </ResultCard>
      )}

      {result.type === "fortune" && (
        <ResultCard>
          <div className="text-center">
            <p className="text-2xl font-bold">&ldquo;{String(result.data.fortune)}&rdquo;</p>
          </div>
        </ResultCard>
      )}

      {result.type === "rate" && (
        <ResultCard>
          <div className="space-y-3 text-center">
            <p className="text-5xl font-bold text-duck-yellow">
              {String(result.data.overall_score)}/10
            </p>
            <p>{String(result.data.summary)}</p>
          </div>
        </ResultCard>
      )}

      {result.type === "roast" && (
        <ResultCard>
          <div className="space-y-3 text-center">
            <p className="text-5xl font-bold">{String(result.data.ducked_score)}/100</p>
            <p className="text-lg">&ldquo;{String(result.data.one_liner)}&rdquo;</p>
          </div>
        </ResultCard>
      )}

      <div className="text-center mt-8">
        <Link
          href="/"
          className="bg-duck-yellow text-black font-semibold px-6 py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors inline-block"
        >
          Try Helliduck Yourself
        </Link>
      </div>
    </div>
  );
}
