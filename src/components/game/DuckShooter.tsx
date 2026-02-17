"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CANVAS_W = 600;
const CANVAS_H = 400;
const ROUND_TIME = 60;

interface Target {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: "bread" | "bug" | "worm";
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

type GameState = "idle" | "playing" | "done";

export default function DuckShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [highScore, setHighScore] = useState(0);
  const [finalStats, setFinalStats] = useState({ score: 0, shots: 0, hits: 0 });

  const stateRef = useRef({
    targets: [] as Target[],
    particles: [] as Particle[],
    score: 0,
    timeLeft: ROUND_TIME,
    frameCount: 0,
    gameState: "idle" as GameState,
    shots: 0,
    hits: 0,
    mouseX: 0,
    mouseY: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-shooter-highscore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.targets = [];
    s.particles = [];
    s.score = 0;
    s.timeLeft = ROUND_TIME;
    s.frameCount = 0;
    s.shots = 0;
    s.hits = 0;
    s.gameState = "playing";
    setGameState("playing");
    setScore(0);
    setTimeLeft(ROUND_TIME);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function handleClick(e: MouseEvent | TouchEvent) {
      const s = stateRef.current;
      if (s.gameState === "idle" || s.gameState === "done") {
        startGame();
        return;
      }

      const rect = canvas!.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      let cx: number, cy: number;

      if ("touches" in e) {
        cx = (e.touches[0].clientX - rect.left) * scaleX;
        cy = (e.touches[0].clientY - rect.top) * scaleY;
      } else {
        cx = (e.clientX - rect.left) * scaleX;
        cy = (e.clientY - rect.top) * scaleY;
      }

      s.shots++;

      // Check hits
      for (let i = s.targets.length - 1; i >= 0; i--) {
        const t = s.targets[i];
        if (!t.alive) continue;
        const dx = cx - t.x;
        const dy = cy - t.y;
        if (dx * dx + dy * dy < t.size * t.size) {
          t.alive = false;
          s.hits++;
          const points = t.type === "bread" ? 10 : t.type === "bug" ? 25 : 50;
          s.score += points;
          setScore(s.score);

          // Particles
          const color = t.type === "bread" ? "#D4A017" : t.type === "bug" ? "#4CAF50" : "#E91E63";
          for (let j = 0; j < 8; j++) {
            const angle = (Math.PI * 2 * j) / 8;
            s.particles.push({
              x: t.x,
              y: t.y,
              vx: Math.cos(angle) * (2 + Math.random() * 3),
              vy: Math.sin(angle) * (2 + Math.random() * 3),
              life: 20,
              color,
            });
          }
          break;
        }
      }
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      stateRef.current.mouseX = (e.clientX - rect.left) * scaleX;
      stateRef.current.mouseY = (e.clientY - rect.top) * scaleY;
    }

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick);
    canvas.addEventListener("mousemove", handleMouseMove);

    let animId: number;
    let lastTimerFrame = 0;

    function gameLoop() {
      const s = stateRef.current;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      if (s.gameState === "idle") {
        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Duck Shooter", CANVAS_W / 2, 140);
        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Shoot flying targets! 60 seconds.", CANVAS_W / 2, 170);
        ctx.fillText("Click anywhere to start", CANVAS_W / 2, 200);

        // Point values
        ctx.font = "12px Arial";
        ctx.fillStyle = "#aaa";
        ctx.fillText("🍞 = 10pts   🐛 = 25pts   🪱 = 50pts", CANVAS_W / 2, 240);
      } else if (s.gameState === "playing") {
        s.frameCount++;

        // Timer (every ~60 frames = ~1 second)
        if (s.frameCount - lastTimerFrame >= 60) {
          lastTimerFrame = s.frameCount;
          s.timeLeft--;
          setTimeLeft(s.timeLeft);
          if (s.timeLeft <= 0) {
            s.gameState = "done";
            setGameState("done");
            setFinalStats({ score: s.score, shots: s.shots, hits: s.hits });
            if (s.score > highScore) {
              setHighScore(s.score);
              localStorage.setItem("helliduck-shooter-highscore", String(s.score));
            }
          }
        }

        // Spawn targets
        if (s.frameCount % 40 === 0) {
          const roll = Math.random();
          let type: Target["type"];
          let size: number;
          if (roll < 0.5) {
            type = "bread"; size = 25;
          } else if (roll < 0.8) {
            type = "bug"; size = 18;
          } else {
            type = "worm"; size = 12;
          }

          const fromLeft = Math.random() > 0.5;
          s.targets.push({
            x: fromLeft ? -size : CANVAS_W + size,
            y: 40 + Math.random() * (CANVAS_H - 120),
            vx: (fromLeft ? 1 : -1) * (1.5 + Math.random() * 2.5),
            vy: (Math.random() - 0.5) * 1.5,
            size,
            type,
            alive: true,
          });
        }

        // Update targets
        for (let i = s.targets.length - 1; i >= 0; i--) {
          const t = s.targets[i];
          t.x += t.vx;
          t.y += t.vy;
          // Bounce off top/bottom
          if (t.y < t.size || t.y > CANVAS_H - t.size) t.vy *= -1;
          // Remove off-screen
          if (t.x < -60 || t.x > CANVAS_W + 60) {
            s.targets.splice(i, 1);
          }
        }

        // Draw targets
        for (const t of s.targets) {
          if (!t.alive) continue;
          ctx.font = `${t.size * 1.5}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const emoji = t.type === "bread" ? "🍞" : t.type === "bug" ? "🐛" : "🪱";
          ctx.fillText(emoji, t.x, t.y);
        }

        // Update particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Draw particles
        for (const p of s.particles) {
          ctx.globalAlpha = p.life / 20;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Crosshair
        ctx.strokeStyle = "rgba(255, 193, 7, 0.6)";
        ctx.lineWidth = 1.5;
        const mx = s.mouseX, my = s.mouseY;
        ctx.beginPath();
        ctx.moveTo(mx - 15, my); ctx.lineTo(mx - 5, my);
        ctx.moveTo(mx + 5, my); ctx.lineTo(mx + 15, my);
        ctx.moveTo(mx, my - 15); ctx.lineTo(mx, my - 5);
        ctx.moveTo(mx, my + 5); ctx.lineTo(mx, my + 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.stroke();

        // HUD
        ctx.fillStyle = "white";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`Score: ${s.score}`, 20, 30);
        ctx.textAlign = "right";
        ctx.fillStyle = s.timeLeft <= 10 ? "#ff4444" : "white";
        ctx.fillText(`${s.timeLeft}s`, CANVAS_W - 20, 30);
      } else if (s.gameState === "done") {
        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Time's Up!", CANVAS_W / 2, 120);

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        ctx.fillText(`Score: ${finalStats.score}`, CANVAS_W / 2, 165);

        ctx.fillStyle = "#aaa";
        ctx.font = "16px Arial";
        const accuracy = finalStats.shots > 0
          ? Math.round((finalStats.hits / finalStats.shots) * 100)
          : 0;
        ctx.fillText(`Accuracy: ${accuracy}% (${finalStats.hits}/${finalStats.shots})`, CANVAS_W / 2, 200);

        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Click to play again", CANVAS_W / 2, 250);
      }

      animId = requestAnimationFrame(gameLoop);
    }

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [startGame, highScore, finalStats]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">Score: </span>
          <span className="font-mono text-duck-yellow">{score}</span>
        </div>
        <div>
          <span className="text-muted">Time: </span>
          <span className="font-mono text-duck-yellow">{timeLeft}s</span>
        </div>
        <div>
          <span className="text-muted">Best: </span>
          <span className="font-mono text-duck-yellow">{highScore}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl border border-card-border max-w-full"
        style={{ touchAction: "none", cursor: "crosshair" }}
      />

      {gameState === "idle" && (
        <p className="text-xs text-muted">
          Click targets to score. Smaller targets = more points.
        </p>
      )}
    </div>
  );
}
