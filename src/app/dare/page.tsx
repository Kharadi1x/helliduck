import type { Metadata } from "next";
import DareCard from "@/components/dare/DareCard";

export const metadata: Metadata = {
  title: "Daily Dare — Helliduck",
  description: "Get a dare from the internet's most opinionated duck. Do it or prove you're a chicken.",
};

export default function DarePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🎯</span>
        <h1 className="text-3xl font-bold mb-2">Daily Dare</h1>
        <p className="text-muted text-sm">
          Accept the dare. Or be a chicken. Your call.
        </p>
      </div>
      <DareCard />
    </div>
  );
}
