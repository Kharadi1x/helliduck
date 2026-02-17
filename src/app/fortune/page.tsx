import type { Metadata } from "next";
import FortuneCookie from "@/components/fortune/FortuneCookie";

export const metadata: Metadata = {
  title: "Brutally Honest Fortune Cookie — Helliduck",
  description: "Fortune cookies with zero filter. The truth hurts, but at least it's funny.",
};

export default function FortunePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Brutally Honest Fortune Cookie</h1>
        <p className="text-muted text-sm">
          Your therapist charges $200 for this kind of honesty.
        </p>
      </div>
      <FortuneCookie />
    </div>
  );
}
