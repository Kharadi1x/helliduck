"use client";

import { useState, useEffect, useCallback } from "react";

const CARD_FACES = ["🦆", "🍞", "🌊", "🥚", "🪶", "🪱", "🐟", "🐛"];

interface Card {
  id: number;
  face: string;
  flipped: boolean;
  matched: boolean;
}

export default function DuckMemory() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...CARD_FACES, ...CARD_FACES];
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    setCards(pairs.map((face, i) => ({ id: i, face, flipped: false, matched: false })));
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setRunning(false);
    setWon(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-memory-best");
    if (stored) setBestScore(parseInt(stored, 10));
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (!running || won) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running, won]);

  function handleCardClick(id: number) {
    if (won) return;
    if (flippedIds.length >= 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    if (!running) setRunning(true);

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const first = newCards.find((c) => c.id === firstId)!;
      const second = newCards.find((c) => c.id === secondId)!;

      if (first.face === second.face) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            )
          );
          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlippedIds([]);

          if (newMatches + 1 === CARD_FACES.length) {
            setWon(true);
            setRunning(false);
            const finalMoves = moves + 1;
            if (bestScore === null || finalMoves < bestScore) {
              setBestScore(finalMoves);
              localStorage.setItem("helliduck-memory-best", String(finalMoves));
            }
          }
        }, 300);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">Moves: </span>
          <span className="font-mono text-duck-yellow">{moves}</span>
        </div>
        <div>
          <span className="text-muted">Matches: </span>
          <span className="font-mono text-duck-yellow">{matches}/{CARD_FACES.length}</span>
        </div>
        <div>
          <span className="text-muted">Time: </span>
          <span className="font-mono text-duck-yellow">{formatTime(timer)}</span>
        </div>
        {bestScore !== null && (
          <div>
            <span className="text-muted">Best: </span>
            <span className="font-mono text-duck-yellow">{bestScore} moves</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl text-3xl flex items-center justify-center transition-all duration-300 border ${
              card.matched
                ? "bg-duck-yellow/20 border-duck-yellow/40 scale-95"
                : card.flipped
                ? "bg-card-bg border-duck-yellow/50 rotate-0"
                : "bg-card-bg border-card-border hover:border-duck-yellow/30 cursor-pointer"
            }`}
            style={{
              transform: card.flipped || card.matched ? "rotateY(0deg)" : "rotateY(0deg)",
            }}
          >
            {card.flipped || card.matched ? (
              <span className="text-2xl sm:text-3xl">{card.face}</span>
            ) : (
              <span className="text-2xl sm:text-3xl opacity-50">🃏</span>
            )}
          </button>
        ))}
      </div>

      {won && (
        <div className="text-center">
          <p className="text-duck-yellow font-bold text-lg mb-2">
            All matched in {moves} moves!
          </p>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-duck-yellow text-black font-semibold rounded-lg hover:bg-duck-yellow/90 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {!won && !running && (
        <button
          onClick={initGame}
          className="text-xs text-muted hover:text-duck-yellow transition-colors cursor-pointer"
        >
          Shuffle & Reset
        </button>
      )}
    </div>
  );
}
