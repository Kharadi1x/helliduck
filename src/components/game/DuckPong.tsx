"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 15;
const PADDLE_H = 80;
const BALL_SIZE = 12;
const WIN_SCORE = 7;

type GameState = "idle" | "playing" | "won" | "lost";

export default function DuckPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const stateRef = useRef({
    playerY: CANVAS_H / 2 - PADDLE_H / 2,
    aiY: CANVAS_H / 2 - PADDLE_H / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H / 2,
    ballVX: 4,
    ballVY: 2,
    playerScore: 0,
    aiScore: 0,
    gameState: "idle" as GameState,
    mouseY: CANVAS_H / 2,
    aiSpeed: 2.5,
  });

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-pong-stats");
    if (stored) setStats(JSON.parse(stored));
  }, []);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.playerY = CANVAS_H / 2 - PADDLE_H / 2;
    s.aiY = CANVAS_H / 2 - PADDLE_H / 2;
    s.ballX = CANVAS_W / 2;
    s.ballY = CANVAS_H / 2;
    s.ballVX = (Math.random() > 0.5 ? 1 : -1) * 4;
    s.ballVY = (Math.random() - 0.5) * 4;
    s.playerScore = 0;
    s.aiScore = 0;
    s.gameState = "playing";
    s.aiSpeed = 2.5;
    setGameState("playing");
    setPlayerScore(0);
    setAiScore(0);
  }, []);

  const quackSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio not supported
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleY = CANVAS_H / rect.height;
      stateRef.current.mouseY = (e.clientY - rect.top) * scaleY;
    }

    function handleTouch(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const scaleY = CANVAS_H / rect.height;
      stateRef.current.mouseY = (e.touches[0].clientY - rect.top) * scaleY;
    }

    function handleClick() {
      const s = stateRef.current;
      if (s.gameState !== "playing") startGame();
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouch);
    canvas.addEventListener("touchstart", handleTouch);
    canvas.addEventListener("click", handleClick);

    let animId: number;

    function resetBall(towardsPlayer: boolean) {
      const s = stateRef.current;
      s.ballX = CANVAS_W / 2;
      s.ballY = CANVAS_H / 2;
      s.ballVX = (towardsPlayer ? -1 : 1) * 4;
      s.ballVY = (Math.random() - 0.5) * 4;
    }

    function gameLoop() {
      const s = stateRef.current;

      // Background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Center line
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_W / 2, 0);
      ctx.lineTo(CANVAS_W / 2, CANVAS_H);
      ctx.stroke();
      ctx.setLineDash([]);

      if (s.gameState === "idle") {
        drawPaddle(ctx, 30, CANVAS_H / 2 - PADDLE_H / 2, true);
        drawPaddle(ctx, CANVAS_W - 30 - PADDLE_W, CANVAS_H / 2 - PADDLE_H / 2, false);
        drawEgg(ctx, CANVAS_W / 2, CANVAS_H / 2);

        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Duck Pong", CANVAS_W / 2, 100);
        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Move mouse to control paddle. First to 7 wins.", CANVAS_W / 2, 130);
        ctx.fillText("Click to start", CANVAS_W / 2, 155);
      } else if (s.gameState === "playing") {
        // Player paddle follows mouse
        s.playerY = Math.max(0, Math.min(CANVAS_H - PADDLE_H, s.mouseY - PADDLE_H / 2));

        // AI paddle
        const aiCenter = s.aiY + PADDLE_H / 2;
        const diff = s.ballY - aiCenter;
        s.aiSpeed = 2.5 + (s.aiScore + s.playerScore) * 0.15;
        if (Math.abs(diff) > 5) {
          s.aiY += Math.sign(diff) * Math.min(s.aiSpeed, Math.abs(diff));
        }
        s.aiY = Math.max(0, Math.min(CANVAS_H - PADDLE_H, s.aiY));

        // Ball physics
        s.ballX += s.ballVX;
        s.ballY += s.ballVY;

        // Top/bottom bounce
        if (s.ballY - BALL_SIZE < 0 || s.ballY + BALL_SIZE > CANVAS_H) {
          s.ballVY *= -1;
          s.ballY = s.ballY - BALL_SIZE < 0 ? BALL_SIZE : CANVAS_H - BALL_SIZE;
        }

        // Player paddle collision
        if (
          s.ballX - BALL_SIZE < 30 + PADDLE_W &&
          s.ballX + BALL_SIZE > 30 &&
          s.ballY > s.playerY &&
          s.ballY < s.playerY + PADDLE_H &&
          s.ballVX < 0
        ) {
          s.ballVX = Math.abs(s.ballVX) * 1.05;
          const hitPos = (s.ballY - s.playerY) / PADDLE_H - 0.5;
          s.ballVY = hitPos * 8;
          quackSound();
        }

        // AI paddle collision
        if (
          s.ballX + BALL_SIZE > CANVAS_W - 30 - PADDLE_W &&
          s.ballX - BALL_SIZE < CANVAS_W - 30 &&
          s.ballY > s.aiY &&
          s.ballY < s.aiY + PADDLE_H &&
          s.ballVX > 0
        ) {
          s.ballVX = -Math.abs(s.ballVX) * 1.05;
          const hitPos = (s.ballY - s.aiY) / PADDLE_H - 0.5;
          s.ballVY = hitPos * 8;
          quackSound();
        }

        // Scoring
        if (s.ballX < 0) {
          s.aiScore++;
          setAiScore(s.aiScore);
          if (s.aiScore >= WIN_SCORE) {
            s.gameState = "lost";
            setGameState("lost");
            const newStats = { wins: stats.wins, losses: stats.losses + 1 };
            setStats(newStats);
            localStorage.setItem("helliduck-pong-stats", JSON.stringify(newStats));
          } else {
            resetBall(true);
          }
        }
        if (s.ballX > CANVAS_W) {
          s.playerScore++;
          setPlayerScore(s.playerScore);
          if (s.playerScore >= WIN_SCORE) {
            s.gameState = "won";
            setGameState("won");
            const newStats = { wins: stats.wins + 1, losses: stats.losses };
            setStats(newStats);
            localStorage.setItem("helliduck-pong-stats", JSON.stringify(newStats));
          } else {
            resetBall(false);
          }
        }

        // Draw
        drawPaddle(ctx, 30, s.playerY, true);
        drawPaddle(ctx, CANVAS_W - 30 - PADDLE_W, s.aiY, false);
        drawEgg(ctx, s.ballX, s.ballY);

        // Scores
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(s.playerScore), CANVAS_W / 4, 60);
        ctx.fillText(String(s.aiScore), (3 * CANVAS_W) / 4, 60);
      } else {
        // Won or lost
        drawPaddle(ctx, 30, s.playerY, true);
        drawPaddle(ctx, CANVAS_W - 30 - PADDLE_W, s.aiY, false);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = s.gameState === "won" ? "#4CAF50" : "#ff4444";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(s.gameState === "won" ? "You Win!" : "You Lose!", CANVAS_W / 2, CANVAS_H / 2 - 20);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText(`${s.playerScore} - ${s.aiScore}`, CANVAS_W / 2, CANVAS_H / 2 + 15);

        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Click to play again", CANVAS_W / 2, CANVAS_H / 2 + 50);
      }

      animId = requestAnimationFrame(gameLoop);
    }

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("touchstart", handleTouch);
      canvas.removeEventListener("click", handleClick);
    };
  }, [startGame, quackSound, stats]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">You: </span>
          <span className="font-mono text-duck-yellow">{playerScore}</span>
        </div>
        <div>
          <span className="text-muted">AI: </span>
          <span className="font-mono text-duck-yellow">{aiScore}</span>
        </div>
        <div>
          <span className="text-muted">Record: </span>
          <span className="font-mono text-duck-yellow">{stats.wins}W-{stats.losses}L</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl border border-card-border cursor-none max-w-full"
        style={{ touchAction: "none" }}
      />

      {gameState === "idle" && (
        <p className="text-xs text-muted">
          Move mouse to control your paddle. First to 7 wins.
        </p>
      )}
    </div>
  );
}

function drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, isPlayer: boolean) {
  // Duck-shaped paddle
  const grad = ctx.createLinearGradient(x, y, x, y + PADDLE_H);
  if (isPlayer) {
    grad.addColorStop(0, "#2E8B57");
    grad.addColorStop(1, "#1B6B3A");
  } else {
    grad.addColorStop(0, "#8B6914");
    grad.addColorStop(1, "#6B4F12");
  }
  ctx.fillStyle = grad;

  // Rounded paddle body
  ctx.beginPath();
  ctx.roundRect(x, y, PADDLE_W, PADDLE_H, 6);
  ctx.fill();

  // Duck head at top of paddle
  const headX = isPlayer ? x + PADDLE_W : x;
  const headSize = 8;
  ctx.beginPath();
  ctx.arc(headX, y + 10, headSize, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(headX + (isPlayer ? 3 : -3), y + 8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(headX + (isPlayer ? 4 : -4), y + 8, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#FF8F00";
  ctx.beginPath();
  if (isPlayer) {
    ctx.moveTo(headX + headSize, y + 10);
    ctx.lineTo(headX + headSize + 6, y + 8);
    ctx.lineTo(headX + headSize + 6, y + 12);
  } else {
    ctx.moveTo(headX - headSize, y + 10);
    ctx.lineTo(headX - headSize - 6, y + 8);
    ctx.lineTo(headX - headSize - 6, y + 12);
  }
  ctx.closePath();
  ctx.fill();
}

function drawEgg(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Egg-shaped ball
  ctx.fillStyle = "#FFF8E1";
  ctx.beginPath();
  ctx.ellipse(x, y, BALL_SIZE * 0.8, BALL_SIZE, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Slight shine
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 3, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}
