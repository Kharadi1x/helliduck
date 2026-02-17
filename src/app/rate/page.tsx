import type { Metadata } from "next";
import RateForm from "@/components/rate/RateForm";

export const metadata: Metadata = {
  title: "Rate My Life Choices — Helliduck",
  description: "Get your questionable decisions rated across boldness, financial sense, happiness, and parent approval.",
};

export default function RatePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">📊</span>
        <h1 className="text-3xl font-bold mb-2">Rate My Life Choices</h1>
        <p className="text-muted text-sm">
          Describe your decision. Get brutally rated.
        </p>
      </div>
      <RateForm />
    </div>
  );
}
