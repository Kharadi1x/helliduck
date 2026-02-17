import ResultCard from "@/components/shared/ResultCard";

interface VerdictProps {
  result: {
    winner: "A" | "B" | "neither";
    verdict: string;
    roast_a: string;
    roast_b: string;
    confidence: number;
  };
}

export default function Verdict({ result }: VerdictProps) {
  const winnerLabel =
    result.winner === "neither"
      ? "Nobody wins. You're both wrong."
      : `Person ${result.winner} wins!`;

  const winnerColor =
    result.winner === "A"
      ? "text-blue-400"
      : result.winner === "B"
        ? "text-green-400"
        : "text-red-400";

  return (
    <ResultCard
      shareText={`The Duck Judge has spoken: "${result.verdict}" (${result.confidence}% confident)`}
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs text-muted mb-1">The verdict is in...</p>
          <p className={`text-2xl font-bold ${winnerColor}`}>
            {winnerLabel}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-muted">Confidence:</span>
            <span className="text-sm font-mono text-duck-yellow">
              {result.confidence}%
            </span>
          </div>
        </div>

        <p className="text-center text-lg">{result.verdict}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1 font-semibold">Person A roast:</p>
            <p className="text-sm text-muted">{result.roast_a}</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
            <p className="text-xs text-green-400 mb-1 font-semibold">Person B roast:</p>
            <p className="text-sm text-muted">{result.roast_b}</p>
          </div>
        </div>
      </div>
    </ResultCard>
  );
}
