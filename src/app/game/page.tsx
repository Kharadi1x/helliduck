import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Duck Games — Helliduck",
  description: "6 duck mini-games. Flappy, Runner, Memory, Shooter, Pong & Jigsaw.",
};

const games = [
  {
    title: "Flappy Duck",
    description: "Dodge the pipes. It's harder than it sounds.",
    emoji: "🐤",
    href: "/game/flappy",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    title: "Duck Runner",
    description: "Chrome Dino but with a duck. Jump, duck, survive.",
    emoji: "🏃",
    href: "/game/runner",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Duck Memory",
    description: "Match duck-themed card pairs. Train that bird brain.",
    emoji: "🧠",
    href: "/game/memory",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Duck Shooter",
    description: "60 seconds. Moving targets. How's your aim?",
    emoji: "🎯",
    href: "/game/shooter",
    color: "from-red-500/20 to-orange-500/20",
  },
  {
    title: "Duck Pong",
    description: "Classic Pong with duck paddles and an egg ball.",
    emoji: "🏓",
    href: "/game/pong",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Duck Jigsaw",
    description: "Scrambled duck. Swap pieces to put it back together.",
    emoji: "🧩",
    href: "/game/jigsaw",
    color: "from-amber-500/20 to-yellow-500/20",
  },
];

export default function GameHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-5xl mb-4 block">🎮</span>
        <h1 className="text-3xl font-bold mb-2">Duck Games</h1>
        <p className="text-muted text-sm">
          6 mini-games. Zero productivity. Maximum quack. 🦆
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group block bg-card-bg border border-card-border rounded-2xl p-6 hover:border-duck-yellow/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.1)] transition-all duration-300"
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
              {game.emoji}
            </div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-duck-yellow transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-muted">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
