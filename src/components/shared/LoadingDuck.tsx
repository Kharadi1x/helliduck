"use client";

const quips = [
  "Consulting the duck oracle...",
  "Quacking the numbers...",
  "Waddling through your request...",
  "Ducking into the AI pond...",
  "Ruffling some feathers...",
  "This duck doesn't rush...",
  "Processing with maximum sass...",
];

export default function LoadingDuck() {
  const quip = quips[Math.floor(Math.random() * quips.length)];

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <span className="text-6xl animate-waddle">🦆</span>
      <p className="text-muted text-sm animate-pulse">{quip}</p>
    </div>
  );
}
