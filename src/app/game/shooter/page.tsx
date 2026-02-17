import type { Metadata } from "next";
import DuckShooter from "@/components/game/DuckShooter";

export const metadata: Metadata = {
  title: "Duck Shooter — Helliduck",
  description: "60-second target practice. Shoot bread, bugs, and worms for points.",
};

export default function ShooterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🎯</span>
        <h1 className="text-3xl font-bold mb-2">Duck Shooter</h1>
        <p className="text-muted text-sm">
          60 seconds. Click the targets. Smaller = more points.
        </p>
      </div>
      <DuckShooter />
    </div>
  );
}
