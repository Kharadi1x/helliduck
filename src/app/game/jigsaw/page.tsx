import type { Metadata } from "next";
import DuckJigsaw from "@/components/game/DuckJigsaw";

export const metadata: Metadata = {
  title: "Duck Jigsaw — Helliduck",
  description: "Reassemble the scrambled duck. A 4x4 jigsaw puzzle.",
};

export default function JigsawPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🧩</span>
        <h1 className="text-3xl font-bold mb-2">Duck Jigsaw</h1>
        <p className="text-muted text-sm">
          Swap pieces to reassemble the duck. Fewest moves wins.
        </p>
      </div>
      <DuckJigsaw />
    </div>
  );
}
