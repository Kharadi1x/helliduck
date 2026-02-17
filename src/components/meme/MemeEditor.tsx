"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import LoadingDuck from "@/components/shared/LoadingDuck";

const MEME_TEMPLATES = [
  { id: "drake", name: "Drake Hotline Bling", description: "No / Yes format" },
  { id: "distracted", name: "Distracted Boyfriend", description: "Looking at something else" },
  { id: "change-my-mind", name: "Change My Mind", description: "Hot take format" },
  { id: "two-buttons", name: "Two Buttons", description: "Impossible choice" },
  { id: "expanding-brain", name: "Expanding Brain", description: "Ascending intelligence" },
  { id: "disaster-girl", name: "Disaster Girl", description: "Chaos energy" },
  { id: "this-is-fine", name: "This Is Fine", description: "Everything is on fire" },
  { id: "surprised-pikachu", name: "Surprised Pikachu", description: "Obvious outcome shock" },
  { id: "stonks", name: "Stonks", description: "Questionable financial wins" },
  { id: "uno-reverse", name: "Uno Reverse Card", description: "Table turned" },
  { id: "always-has-been", name: "Always Has Been", description: "Astronaut revelation" },
  { id: "is-this", name: "Is This a Pigeon?", description: "Misidentification" },
];

const CANVAS_W = 500;
const CANVAS_H = 500;

export default function MemeEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [error, setError] = useState("");

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Template name
    const tmpl = MEME_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (tmpl) {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = "#666";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`[ ${tmpl.name} ]`, CANVAS_W / 2, CANVAS_H / 2);
    }

    // Draw text function
    function drawText(text: string, y: number) {
      if (!text || !ctx) return;
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.fillStyle = "white";
      ctx.strokeText(text.toUpperCase(), CANVAS_W / 2, y);
      ctx.fillText(text.toUpperCase(), CANVAS_W / 2, y);
    }

    drawText(topText, 50);
    drawText(bottomText, CANVAS_H - 20);
  }, [selectedTemplate, topText, bottomText]);

  useEffect(() => {
    if (selectedTemplate) drawMeme();
  }, [selectedTemplate, topText, bottomText, drawMeme]);

  async function generateCaptions() {
    if (!selectedTemplate) return;
    const tmpl = MEME_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!tmpl) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: tmpl.name,
          context: context || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Something went wrong");
      }

      const data = await res.json();
      setTopText(data.top_text);
      setBottomText(data.bottom_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadMeme() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "helliduck-meme.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="space-y-6">
      {!selectedTemplate ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MEME_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className="bg-card-bg border border-card-border rounded-xl p-4 text-left hover:border-duck-yellow/50 transition-colors"
            >
              <p className="font-medium text-sm">{tmpl.name}</p>
              <p className="text-xs text-muted mt-1">{tmpl.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setTopText("");
              setBottomText("");
            }}
            className="text-sm text-muted hover:text-duck-yellow transition-colors"
          >
            &larr; Pick different template
          </button>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-xl border border-card-border max-w-full"
            />
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Top text"
              className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50"
            />
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Bottom text"
              className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Topic/context for AI (optional)"
                className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-duck-yellow/50 text-sm"
              />
            </div>
            <button
              onClick={generateCaptions}
              disabled={loading}
              className="bg-duck-yellow text-black font-semibold px-6 py-3 rounded-xl hover:bg-duck-yellow-dark transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? "..." : "AI Generate"}
            </button>
          </div>

          {loading && <LoadingDuck />}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={downloadMeme}
            className="w-full py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:border-duck-yellow/50 transition-colors"
          >
            Download as PNG
          </button>
        </>
      )}
    </div>
  );
}
