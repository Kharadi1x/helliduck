"use client";

import Link from "next/link";
import { quack } from "@/lib/quack";

interface FeatureCardProps {
  title: string;
  description: string;
  emoji: string;
  href: string;
  tag?: string;
}

export default function FeatureCard({
  title,
  description,
  emoji,
  href,
  tag,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      onClick={quack}
      className="group block bg-card-bg border border-card-border rounded-2xl p-6 hover:border-duck-yellow/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.1)] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl group-hover:animate-waddle">{emoji}</span>
        {tag && (
          <span className="text-xs px-2 py-1 rounded-full bg-duck-yellow/10 text-duck-yellow">
            {tag}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1 group-hover:text-duck-yellow transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted">{description}</p>
    </Link>
  );
}
