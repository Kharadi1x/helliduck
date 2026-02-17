import type { Metadata } from "next";
import DuckGame from "@/components/game/DuckGame";

export const metadata: Metadata = {
  title: "Flappy Duck — Helliduck",
  description: "Dodge the pipes as a duck. Simple, addictive, and harder than it looks.",
};

export default function FlappyPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🐤</span>
        <h1 className="text-3xl font-bold mb-2">Flappy Duck</h1>
        <p className="text-muted text-sm">
          Dodge the pipes. It&apos;s harder than it sounds.
        </p>
      </div>
      <DuckGame />
    </div>
  );
}
