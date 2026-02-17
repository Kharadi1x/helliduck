import type { Metadata } from "next";
import DuckRunner from "@/components/game/DuckRunner";

export const metadata: Metadata = {
  title: "Duck Runner — Helliduck",
  description: "Chrome Dino style runner game with a duck. Jump and crouch to survive.",
};

export default function RunnerPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🏃</span>
        <h1 className="text-3xl font-bold mb-2">Duck Runner</h1>
        <p className="text-muted text-sm">
          Jump over rocks, dodge fences, avoid birds. How far can you go?
        </p>
      </div>
      <DuckRunner />
    </div>
  );
}
