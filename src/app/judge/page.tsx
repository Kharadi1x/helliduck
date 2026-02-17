import type { Metadata } from "next";
import JudgeForm from "@/components/judge/JudgeForm";

export const metadata: Metadata = {
  title: "Judge My Argument — Helliduck",
  description: "Settle disputes with an AI judge that's sarcastic but fair. Submit both sides and get a verdict.",
};

export default function JudgePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">⚖️</span>
        <h1 className="text-3xl font-bold mb-2">Judge My Argument</h1>
        <p className="text-muted text-sm">
          Present both sides. The duck will deliver its verdict.
        </p>
      </div>
      <JudgeForm />
    </div>
  );
}
