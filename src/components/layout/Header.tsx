"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const BABY_COUNT = 3;
const WALK_DISTANCE = 60; // px (~5cm on most screens)
const WALK_DURATION = 1800; // ms for one full back-and-forth

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [walking, setWalking] = useState(false);
  const [facingRight, setFacingRight] = useState(true);

  const startWalk = useCallback(() => {
    if (walking) return;
    setWalking(true);
    setFacingRight(true);

    // Flip direction halfway through
    const flipTimer = setTimeout(() => setFacingRight(false), WALK_DURATION / 2);

    // Stop walking after full cycle
    const stopTimer = setTimeout(() => {
      setWalking(false);
      setFacingRight(true);
    }, WALK_DURATION);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(stopTimer);
    };
  }, [walking]);

  useEffect(() => {
    function handleQuack() {
      startWalk();
    }

    window.addEventListener("helliduck:quack", handleQuack);
    return () => window.removeEventListener("helliduck:quack", handleQuack);
  }, [startWalk]);

  return (
    <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-end gap-0 relative">
            {/* Mama duck + babies container */}
            <div
              className="flex items-end transition-transform"
              style={{
                transform: walking
                  ? undefined
                  : "translateX(0)",
                animation: walking
                  ? `duckWalk ${WALK_DURATION}ms ease-in-out forwards`
                  : "none",
              }}
            >
              {/* Mama duck */}
              <span
                className="text-3xl leading-none inline-block"
                style={{
                  transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
                  animation: walking ? "duckBob 0.3s ease-in-out infinite" : "none",
                  transition: "transform 0.15s",
                }}
              >
                🦆
              </span>

              {/* Baby ducks */}
              {Array.from({ length: BABY_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className="leading-none inline-block"
                  style={{
                    fontSize: `${14 - i * 2}px`,
                    marginLeft: `${-2 + i}px`,
                    opacity: walking ? 1 : 0,
                    transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
                    animation: walking
                      ? `duckBob 0.3s ease-in-out infinite ${0.1 * (i + 1)}s, babyAppear 0.3s ease-out forwards ${0.1 * i}s`
                      : "none",
                    transition: "opacity 0.3s, transform 0.15s",
                  }}
                >
                  🐥
                </span>
              ))}
            </div>
          </div>

          <span className="text-xl font-bold text-duck-yellow">
            helliduck<span className="text-muted font-normal">.com</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              href="/"
              className="text-sm text-muted hover:text-duck-yellow transition-colors"
            >
              All Features
            </Link>
          )}
          <Link
            href="/api-docs"
            className="text-sm text-muted hover:text-duck-yellow transition-colors"
          >
            API
          </Link>
        </div>
      </div>

      {/* Inline keyframes for duck walk */}
      <style>{`
        @keyframes duckWalk {
          0% { transform: translateX(0); }
          50% { transform: translateX(${WALK_DISTANCE}px); }
          100% { transform: translateX(0); }
        }
        @keyframes duckBob {
          0%, 100% { transform: translateY(0) scaleX(var(--duck-scale, 1)); }
          50% { transform: translateY(-3px) scaleX(var(--duck-scale, 1)); }
        }
        @keyframes babyAppear {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </header>
  );
}
