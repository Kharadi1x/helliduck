import type { Metadata } from "next";
import RoastForm from "@/components/roast/RoastForm";

export const metadata: Metadata = {
  title: "Roast My Website — Helliduck",
  description: "Submit any URL and watch it get absolutely destroyed. Design, performance, SEO, and copy — nothing is safe.",
};

export default function RoastPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🔥</span>
        <h1 className="text-3xl font-bold mb-2">Roast My Website</h1>
        <p className="text-muted text-sm">
          Submit a URL. The duck will tear it apart across design, performance,
          SEO, and copy.
        </p>
      </div>
      <RoastForm />
    </div>
  );
}
