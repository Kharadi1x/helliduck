import type { Metadata } from "next";
import DuckMemory from "@/components/game/DuckMemory";

export const metadata: Metadata = {
  title: "Duck Memory — Helliduck",
  description: "Match duck-themed card pairs. Test your memory with 16 cards.",
};

export default function MemoryPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🧠</span>
        <h1 className="text-3xl font-bold mb-2">Duck Memory</h1>
        <p className="text-muted text-sm">
          Match all 8 pairs. Fewest moves wins.
        </p>
      </div>
      <DuckMemory />
    </div>
  );
}
