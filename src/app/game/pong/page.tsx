import type { Metadata } from "next";
import DuckPong from "@/components/game/DuckPong";

export const metadata: Metadata = {
  title: "Duck Pong — Helliduck",
  description: "Classic Pong with duck paddles and an egg ball. First to 7 wins.",
};

export default function PongPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🏓</span>
        <h1 className="text-3xl font-bold mb-2">Duck Pong</h1>
        <p className="text-muted text-sm">
          Classic Pong with duck paddles. First to 7 wins.
        </p>
      </div>
      <DuckPong />
    </div>
  );
}
