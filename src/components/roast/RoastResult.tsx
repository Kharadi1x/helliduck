import ResultCard from "@/components/shared/ResultCard";
import type { RoastData } from "./RoastForm";
import Link from "next/link";

interface RoastResultProps {
  data: RoastData;
  url: string;
}

const categories = [
  { key: "design_roast", label: "Design", emoji: "🎨" },
  { key: "performance_roast", label: "Performance", emoji: "🐌" },
  { key: "seo_roast", label: "SEO", emoji: "🔍" },
  { key: "copy_roast", label: "Copy", emoji: "✍️" },
] as const;

export default function RoastResult({ data, url }: RoastResultProps) {
  const scoreColor =
    data.ducked_score >= 70
      ? "text-green-400"
      : data.ducked_score >= 40
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="space-y-4">
      <ResultCard
        shareText={`${url} got a ${data.ducked_score}/100 Ducked Score. "${data.one_liner}"`}
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className={`text-5xl font-bold ${scoreColor}`}>
              {data.ducked_score}/100
            </p>
            <p className="text-xs text-muted mt-1">Ducked Score</p>
            <p className="text-lg font-medium mt-3">&ldquo;{data.one_liner}&rdquo;</p>
          </div>

          <div className="space-y-3">
            {categories.map(({ key, label, emoji }) => (
              <div
                key={key}
                className="bg-card-bg border border-card-border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{emoji}</span>
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <p className="text-sm text-muted">{data[key]}</p>
              </div>
            ))}
          </div>

          <div className="bg-card-bg border border-card-border rounded-lg p-4">
            <p className="text-xs text-muted mb-2 font-semibold">Raw Metrics</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted">Load time:</span>{" "}
                <span className="font-mono">{data.metrics.loadTimeMs}ms</span>
              </div>
              <div>
                <span className="text-muted">HTML size:</span>{" "}
                <span className="font-mono">{data.metrics.htmlSizeKB}KB</span>
              </div>
              <div>
                <span className="text-muted">Scripts:</span>{" "}
                <span className="font-mono">{data.metrics.scriptCount}</span>
              </div>
              <div>
                <span className="text-muted">Images:</span>{" "}
                <span className="font-mono">{data.metrics.imgCount}</span>
              </div>
              <div>
                <span className="text-muted">No alt:</span>{" "}
                <span className="font-mono">{data.metrics.imgWithoutAlt}</span>
              </div>
              <div>
                <span className="text-muted">Viewport:</span>{" "}
                <span className="font-mono">{data.metrics.hasViewport ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </ResultCard>

      <Link
        href="/clapback"
        className="block w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors border border-red-500/20 text-center"
      >
        Got roasted? Clap Back
      </Link>
    </div>
  );
}
