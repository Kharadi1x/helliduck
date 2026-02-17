import type { Metadata } from "next";
import ExcuseForm from "@/components/excuse/ExcuseForm";

export const metadata: Metadata = {
  title: "Excuse Generator — Helliduck",
  description: "AI-crafted excuses with adjustable believability. From absurd to boringly realistic.",
};

export default function ExcusePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🙈</span>
        <h1 className="text-3xl font-bold mb-2">Excuse Generator</h1>
        <p className="text-muted text-sm">
          Need to bail? Get AI-crafted excuses with adjustable believability.
        </p>
      </div>
      <ExcuseForm />
    </div>
  );
}
