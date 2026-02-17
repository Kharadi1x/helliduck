import type { Metadata } from "next";
import MemeEditor from "@/components/meme/MemeEditor";

export const metadata: Metadata = {
  title: "Meme Generator — Helliduck",
  description: "Pick a meme template, let AI write the captions, and download your masterpiece.",
};

export default function MemePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">😂</span>
        <h1 className="text-3xl font-bold mb-2">Meme Generator</h1>
        <p className="text-muted text-sm">
          Pick a template. Write your own text or let AI do the heavy lifting.
        </p>
      </div>
      <MemeEditor />
    </div>
  );
}
