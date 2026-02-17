"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const GRID = 4; // 4x4 = 16 pieces
const PIECE_COUNT = GRID * GRID;

interface Piece {
  id: number; // original position (0..15)
  currentPos: number; // where it sits now
}

// Duck pixel art pattern — each cell is a color
const DUCK_ART: string[][] = [
  ["#1a1a2e", "#1a1a2e", "#FFC107", "#FFC107"],
  ["#1a1a2e", "#FFC107", "#FFC107", "#FFC107"],
  ["#FF5722", "#FFC107", "#FFC107", "#1a1a2e"],
  ["#1a1a2e", "#FFC107", "#FFC107", "#1a1a2e"],
];

function drawPuzzleImage(
  canvas: HTMLCanvasElement,
  size: number
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = size;
  canvas.height = size;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#0f0f23");
  bg.addColorStop(1, "#1a1a3e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Water at bottom
  ctx.fillStyle = "#1565C0";
  ctx.beginPath();
  ctx.ellipse(cx, size * 0.82, size * 0.42, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#FFC107";
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.08, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(cx + size * 0.08, cy - size * 0.12, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx + size * 0.13, cy - size * 0.14, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx + size * 0.135, cy - size * 0.145, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#FF5722";
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.2, cy - size * 0.12);
  ctx.lineTo(cx + size * 0.3, cy - size * 0.1);
  ctx.lineTo(cx + size * 0.2, cy - size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Wing
  ctx.fillStyle = "#FFB300";
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.04, cy + size * 0.06, size * 0.1, size * 0.07, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = "#FFC107";
  ctx.font = `bold ${size * 0.06}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("HELLIDUCK", cx, size * 0.15);

  // Draw faint grid lines for guidance
  ctx.strokeStyle = "rgba(255,193,7,0.15)";
  ctx.lineWidth = 1;
  const cell = size / GRID;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
    ctx.stroke();
  }
}

function shuffle(arr: Piece[]): Piece[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap currentPos
    const tmp = a[i].currentPos;
    a[i].currentPos = a[j].currentPos;
    a[j].currentPos = tmp;
  }
  return a;
}

function isSolved(pieces: Piece[]): boolean {
  return pieces.every((p) => p.id === p.currentPos);
}

export default function DuckJigsaw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [puzzleSize, setPuzzleSize] = useState(320);
  const [imageReady, setImageReady] = useState(false);

  const initGame = useCallback(() => {
    const initial: Piece[] = Array.from({ length: PIECE_COUNT }, (_, i) => ({
      id: i,
      currentPos: i,
    }));
    const shuffled = shuffle(initial);
    // Ensure not already solved
    if (isSolved(shuffled)) {
      const tmp = shuffled[0].currentPos;
      shuffled[0].currentPos = shuffled[1].currentPos;
      shuffled[1].currentPos = tmp;
    }
    setPieces(shuffled);
    setSelected(null);
    setMoves(0);
    setTimer(0);
    setRunning(false);
    setWon(false);
  }, []);

  // Responsive sizing
  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 32, 400);
      setPuzzleSize(Math.max(240, w));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Draw puzzle image
  useEffect(() => {
    if (canvasRef.current) {
      drawPuzzleImage(canvasRef.current, puzzleSize);
      setImageReady(true);
    }
  }, [puzzleSize]);

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-jigsaw-best");
    if (stored) setBestScore(parseInt(stored, 10));
    initGame();
  }, [initGame]);

  // Timer
  useEffect(() => {
    if (!running || won) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [running, won]);

  function handlePieceClick(pieceIndex: number) {
    if (won) return;
    if (!running) setRunning(true);

    if (selected === null) {
      setSelected(pieceIndex);
      return;
    }

    if (selected === pieceIndex) {
      setSelected(null);
      return;
    }

    // Swap the two pieces
    const newPieces = [...pieces];
    const tmp = newPieces[selected].currentPos;
    newPieces[selected].currentPos = newPieces[pieceIndex].currentPos;
    newPieces[pieceIndex].currentPos = tmp;

    const newMoves = moves + 1;
    setMoves(newMoves);
    setSelected(null);
    setPieces(newPieces);

    if (isSolved(newPieces)) {
      setWon(true);
      setRunning(false);
      if (bestScore === null || newMoves < bestScore) {
        setBestScore(newMoves);
        localStorage.setItem("helliduck-jigsaw-best", String(newMoves));
      }
    }
  }

  const cellSize = puzzleSize / GRID;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Build a lookup: currentPos -> piece
  const positionMap = new Map<number, Piece>();
  pieces.forEach((p) => positionMap.set(p.currentPos, p));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hidden canvas for generating the image */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">Moves: </span>
          <span className="font-mono text-duck-yellow">{moves}</span>
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

      <p className="text-xs text-muted">
        Click two pieces to swap them. Reassemble the duck!
      </p>

      {/* Puzzle grid */}
      <div
        className="relative border-2 border-card-border rounded-xl overflow-hidden"
        style={{ width: puzzleSize, height: puzzleSize }}
      >
        {imageReady &&
          pieces.map((piece, idx) => {
            const isSelected = selected === idx;
            const isCorrect = piece.id === piece.currentPos;
            // Where this piece currently sits
            const row = Math.floor(piece.currentPos / GRID);
            const col = piece.currentPos % GRID;
            // Source region from original image
            const srcRow = Math.floor(piece.id / GRID);
            const srcCol = piece.id % GRID;

            return (
              <button
                key={piece.id}
                onClick={() => handlePieceClick(idx)}
                className={`absolute transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-duck-yellow z-10 scale-105"
                    : won && isCorrect
                    ? ""
                    : "hover:brightness-110"
                }`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  left: col * cellSize,
                  top: row * cellSize,
                }}
              >
                <canvas
                  className="pointer-events-none"
                  style={{ width: cellSize, height: cellSize }}
                  ref={(el) => {
                    if (!el || !canvasRef.current) return;
                    el.width = cellSize;
                    el.height = cellSize;
                    const ctx = el.getContext("2d");
                    if (!ctx) return;
                    ctx.drawImage(
                      canvasRef.current,
                      srcCol * cellSize,
                      srcRow * cellSize,
                      cellSize,
                      cellSize,
                      0,
                      0,
                      cellSize,
                      cellSize
                    );
                    // Dim incorrect pieces slightly
                    if (!isCorrect && !won) {
                      ctx.fillStyle = "rgba(0,0,0,0.1)";
                      ctx.fillRect(0, 0, cellSize, cellSize);
                    }
                  }}
                />
                {/* Position number hint */}
                <span className="absolute top-0.5 left-1 text-[9px] font-mono text-white/30">
                  {piece.id + 1}
                </span>
              </button>
            );
          })}

        {/* Grid lines */}
        {Array.from({ length: GRID - 1 }, (_, i) => (
          <div key={`lines-${i}`}>
            <div
              className="absolute bg-white/10 pointer-events-none"
              style={{
                left: (i + 1) * cellSize - 0.5,
                top: 0,
                width: 1,
                height: puzzleSize,
              }}
            />
            <div
              className="absolute bg-white/10 pointer-events-none"
              style={{
                top: (i + 1) * cellSize - 0.5,
                left: 0,
                height: 1,
                width: puzzleSize,
              }}
            />
          </div>
        ))}
      </div>

      {won && (
        <div className="text-center">
          <p className="text-duck-yellow font-bold text-lg mb-2">
            Puzzle solved in {moves} moves! 🧩
          </p>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-duck-yellow text-black font-semibold rounded-lg hover:bg-duck-yellow/90 transition-colors cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}

      {!won && (
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
