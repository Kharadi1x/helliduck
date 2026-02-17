import FeatureCard from "@/components/layout/FeatureCard";
import DuckParade from "@/components/layout/DuckParade";

const features = [
  {
    title: "Excuse Generator",
    description: "Need to bail? Get AI-crafted excuses with adjustable believability.",
    emoji: "🙈",
    href: "/excuse",
    tag: "AI",
  },
  {
    title: "Fortune Cookie",
    description: "Brutally honest fortunes your therapist would charge $200 for.",
    emoji: "🥠",
    href: "/fortune",
    tag: "AI",
  },
  {
    title: "Judge My Argument",
    description: "Settle disputes with an unbiased (but sarcastic) AI verdict.",
    emoji: "⚖️",
    href: "/judge",
    tag: "AI",
  },
  {
    title: "Rate My Life Choices",
    description: "Get your questionable decisions rated across 4 brutal categories.",
    emoji: "📊",
    href: "/rate",
    tag: "AI",
  },
  {
    title: "Daily Dare",
    description: "Get a dare. Do it. Or prove you're a chicken.",
    emoji: "🎯",
    href: "/dare",
    tag: "AI",
  },
  {
    title: "Roast My Website",
    description: "Submit any URL and watch it get absolutely destroyed.",
    emoji: "🔥",
    href: "/roast",
    tag: "AI + Web",
  },
  {
    title: "Clap Back",
    description: "Got roasted? Paste the burn, get a devastating comeback.",
    emoji: "👏",
    href: "/clapback",
    tag: "AI",
  },
  {
    title: "Duck Game",
    description: "5 duck mini-games. Flappy, Runner, Memory, Shooter & Pong.",
    emoji: "🎮",
    href: "/game",
    tag: "Game",
  },
  {
    title: "Meme Generator",
    description: "Pick a template, let AI write the captions. Instant comedy.",
    emoji: "😂",
    href: "/meme",
    tag: "AI",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <DuckParade />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          The internet&apos;s most{" "}
          <span className="text-duck-yellow">opinionated</span> duck.
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto">
          9 AI-powered tools for entertainment, chaos, and questionable life
          advice. No sign-up required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <FeatureCard key={feature.href} {...feature} />
        ))}
      </div>

      <div className="text-center mt-16 text-sm text-muted">
        <p>Free to use. No sign-up. Just vibes and questionable AI.</p>
      </div>
    </div>
  );
}
