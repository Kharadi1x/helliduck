import type { Metadata } from "next";
import ClapbackForm from "@/components/clapback/ClapbackForm";

export const metadata: Metadata = {
  title: "Clap Back — Helliduck",
  description: "Got roasted? Paste what they said and get a devastating AI-generated comeback to send back.",
};

export default function ClapbackPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">👏</span>
        <h1 className="text-3xl font-bold mb-2">Clap Back</h1>
        <p className="text-muted text-sm">
          Got roasted? Paste what they said. The duck will arm you with a
          comeback so devastating they&apos;ll need therapy.
        </p>
      </div>
      <ClapbackForm />
    </div>
  );
}
