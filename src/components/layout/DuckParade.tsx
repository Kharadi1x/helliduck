"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const BABY_COUNT = 4;
const MAMA_SIZE = 80;
const BABY_SIZES = [32, 28, 26, 24];

const OPINIONS = [
  "I have opinions.",
  "You're welcome.",
  "I said what I said.",
  "Don't @ me.",
  "Quack means no.",
  "I judge silently.",
  "Bread is overrated.",
  "Try me.",
  "Bold choice...",
  "Sure, Jan.",
];

export default function DuckParade() {
  const mamaRef = useRef<HTMLDivElement>(null);
  const babyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [opinion, setOpinion] = useState(OPINIONS[0]);
  const [showBubble, setShowBubble] = useState(true);

  // Bob animation
  useEffect(() => {
    let animId: number;

    function tick(now: number) {
      const mamaBob = Math.sin(now * 0.003) * 3;
      if (mamaRef.current) {
        mamaRef.current.style.transform = `translateY(${mamaBob}px)`;
      }

      for (let i = 0; i < BABY_COUNT; i++) {
        const el = babyRefs.current[i];
        if (!el) continue;
        const babyBob = Math.sin((now + (i + 1) * 300) * 0.004) * 2;
        el.style.transform = `translateY(${babyBob}px)`;
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Rotate opinions
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setOpinion(OPINIONS[Math.floor(Math.random() * OPINIONS.length)]);
        setShowBubble(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center mb-6 gap-2">
      {/* Speech bubble */}
      <div
        className="relative bg-card-bg border border-card-border rounded-xl px-4 py-2 text-sm font-medium text-duck-yellow transition-all duration-300"
        style={{
          opacity: showBubble ? 1 : 0,
          transform: showBubble ? "translateY(0) scale(1)" : "translateY(4px) scale(0.95)",
        }}
      >
        <span className="italic">&ldquo;{opinion}&rdquo;</span>
        {/* Bubble tail */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid var(--card-border)",
          }}
        />
        <div
          className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "7px solid var(--card-bg)",
          }}
        />
      </div>

      {/* Duck family row */}
      <div className="flex items-end gap-1">
        {/* Left babies */}
        {Array.from({ length: 2 }).map((_, i) => {
          const size = BABY_SIZES[i];
          return (
            <div
              key={`left-${i}`}
              ref={(el) => { babyRefs.current[i] = el; }}
              style={{ width: size, height: size, willChange: "transform" }}
            >
              <Image
                src="/images/baby-duck.svg"
                alt=""
                width={size}
                height={size}
                priority
                draggable={false}
                style={{ pointerEvents: "none", userSelect: "none" }}
              />
            </div>
          );
        })}

        {/* Mama duck — tilted with attitude */}
        <div
          ref={mamaRef}
          className="relative mx-1"
          style={{ width: MAMA_SIZE, height: MAMA_SIZE, willChange: "transform" }}
        >
          <Image
            src="/images/mama-duck.svg"
            alt="Helliduck — the internet's most opinionated duck"
            width={MAMA_SIZE}
            height={MAMA_SIZE}
            priority
            draggable={false}
            className="animate-spin-slow"
            style={{ pointerEvents: "none", userSelect: "none" }}
          />
        </div>

        {/* Right babies */}
        {Array.from({ length: 2 }).map((_, i) => {
          const size = BABY_SIZES[i + 2];
          return (
            <div
              key={`right-${i}`}
              ref={(el) => { babyRefs.current[i + 2] = el; }}
              style={{ width: size, height: size, willChange: "transform" }}
            >
              <Image
                src="/images/baby-duck.svg"
                alt=""
                width={size}
                height={size}
                priority
                draggable={false}
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                  transform: "scaleX(-1)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
