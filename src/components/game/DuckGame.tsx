"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CANVAS_W = 400;
const CANVAS_H = 600;
const GRAVITY = 0.4;
const JUMP_FORCE = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.5;
const DUCK_SIZE = 30;
const DUCK_X = 80;

interface Pipe {
  x: number;
  topHeight: number;
  scored: boolean;
}

type GameState = "idle" | "playing" | "dead";

export default function DuckGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const stateRef = useRef({
    duckY: CANVAS_H / 2,
    velocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
    gameState: "idle" as GameState,
    wingAngle: 0,
    lastJumpFrame: -999,
  });

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-highscore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === "idle" || s.gameState === "dead") {
      s.duckY = CANVAS_H / 2;
      s.velocity = JUMP_FORCE;
      s.pipes = [];
      s.score = 0;
      s.frameCount = 0;
      s.gameState = "playing";
      s.lastJumpFrame = 0;
      setGameState("playing");
      setScore(0);
    } else if (s.gameState === "playing") {
      s.velocity = JUMP_FORCE;
      s.lastJumpFrame = s.frameCount;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }

    function handleClick() {
      jump();
    }

    window.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick);

    let animId: number;

    function gameLoop() {
      const s = stateRef.current;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Wing flap animation
      const framesSinceJump = s.frameCount - s.lastJumpFrame;
      if (framesSinceJump < 15) {
        s.wingAngle = Math.sin(framesSinceJump * 0.8) * 30;
      } else {
        s.wingAngle *= 0.9;
      }

      if (s.gameState === "idle") {
        drawDuck(ctx, DUCK_X, CANVAS_H / 2, 0, 0);
        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Flappy Duck", CANVAS_W / 2, 180);
        ctx.fillStyle = "#888";
        ctx.font = "16px Arial";
        ctx.fillText("Click or press Space to start", CANVAS_W / 2, 220);
      } else if (s.gameState === "playing") {
        s.frameCount++;

        s.velocity += GRAVITY;
        s.duckY += s.velocity;

        if (s.frameCount % 90 === 0) {
          const topH = 60 + Math.random() * (CANVAS_H - PIPE_GAP - 120);
          s.pipes.push({ x: CANVAS_W, topHeight: topH, scored: false });
        }

        for (let i = s.pipes.length - 1; i >= 0; i--) {
          s.pipes[i].x -= PIPE_SPEED;

          if (!s.pipes[i].scored && s.pipes[i].x + PIPE_WIDTH < DUCK_X) {
            s.pipes[i].scored = true;
            s.score++;
            setScore(s.score);
          }

          if (s.pipes[i].x + PIPE_WIDTH < 0) {
            s.pipes.splice(i, 1);
          }
        }

        for (const pipe of s.pipes) {
          ctx.fillStyle = "#FFC107";
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          const bottomY = pipe.topHeight + PIPE_GAP;
          ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - bottomY);

          ctx.fillStyle = "#E5AC00";
          ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, PIPE_WIDTH + 8, 20);
          ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 20);
          ctx.fillStyle = "#FFC107";
        }

        const rotation = Math.min(s.velocity * 3, 45);
        drawDuck(ctx, DUCK_X, s.duckY, rotation, s.wingAngle);

        const duckRect = {
          left: DUCK_X - DUCK_SIZE / 2,
          right: DUCK_X + DUCK_SIZE / 2,
          top: s.duckY - DUCK_SIZE / 2,
          bottom: s.duckY + DUCK_SIZE / 2,
        };

        if (duckRect.top < 0 || duckRect.bottom > CANVAS_H) {
          die();
        }

        for (const pipe of s.pipes) {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          if (duckRect.right > pipeLeft && duckRect.left < pipeRight) {
            if (duckRect.top < pipe.topHeight || duckRect.bottom > pipe.topHeight + PIPE_GAP) {
              die();
              break;
            }
          }
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(s.score), CANVAS_W / 2, 60);
      } else if (s.gameState === "dead") {
        for (const pipe of s.pipes) {
          ctx.fillStyle = "#FFC107";
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          const bottomY = pipe.topHeight + PIPE_GAP;
          ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - bottomY);
        }
        drawDuck(ctx, DUCK_X, s.duckY, 90, 0);

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", CANVAS_W / 2, CANVAS_H / 2 - 40);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2);

        ctx.fillStyle = "#888";
        ctx.font = "16px Arial";
        ctx.fillText("Click or Space to restart", CANVAS_W / 2, CANVAS_H / 2 + 40);
      }

      animId = requestAnimationFrame(gameLoop);
    }

    function die() {
      const s = stateRef.current;
      s.gameState = "dead";
      setGameState("dead");
      if (s.score > highScore) {
        setHighScore(s.score);
        localStorage.setItem("helliduck-highscore", String(s.score));
      }
    }

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [jump, highScore]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted">Score: </span>
          <span className="font-mono text-duck-yellow">{score}</span>
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
        className="rounded-xl border border-card-border cursor-pointer max-w-full"
        style={{ touchAction: "none" }}
      />

      {gameState === "idle" && (
        <p className="text-xs text-muted">
          Click the canvas or press Space / Up Arrow to play
        </p>
      )}
    </div>
  );
}

function drawDuck(ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, wingAngle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);

  // Orange feet trailing behind
  ctx.fillStyle = "#FF8F00";
  ctx.beginPath();
  ctx.moveTo(-12, 12);
  ctx.lineTo(-22, 16);
  ctx.lineTo(-18, 12);
  ctx.lineTo(-24, 14);
  ctx.lineTo(-14, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, 16);
  ctx.lineTo(-20, 20);
  ctx.lineTo(-16, 16);
  ctx.lineTo(-22, 18);
  ctx.lineTo(-12, 14);
  ctx.closePath();
  ctx.fill();

  // Brown body
  const bodyGrad = ctx.createRadialGradient(0, 2, 2, 0, 2, DUCK_SIZE / 1.8);
  bodyGrad.addColorStop(0, "#8B6914");
  bodyGrad.addColorStop(1, "#6B4F12");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2, DUCK_SIZE / 2, DUCK_SIZE / 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // White neck ring
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(4, -4, 6, 3, -0.2, -0.5, Math.PI * 1.5);
  ctx.stroke();

  // Green head with gradient (mallard style)
  const headGrad = ctx.createRadialGradient(8, -8, 1, 8, -8, 12);
  headGrad.addColorStop(0, "#2E8B57");
  headGrad.addColorStop(0.7, "#1B6B3A");
  headGrad.addColorStop(1, "#145228");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(8, -8, 10, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head shine
  ctx.fillStyle = "rgba(100, 220, 140, 0.3)";
  ctx.beginPath();
  ctx.ellipse(6, -12, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye (white)
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(12, -10, 5, 0, Math.PI * 2);
  ctx.fill();

  // Eye (iris)
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(13, -10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlight/shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(14, -11.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak (smooth rounded shape)
  ctx.fillStyle = "#FF8F00";
  ctx.beginPath();
  ctx.moveTo(16, -8);
  ctx.quadraticCurveTo(26, -10, 26, -6);
  ctx.quadraticCurveTo(26, -2, 16, -4);
  ctx.closePath();
  ctx.fill();
  // Beak line
  ctx.strokeStyle = "#CC7200";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(16, -6);
  ctx.lineTo(25, -6);
  ctx.stroke();

  // Wing with flap animation
  ctx.save();
  ctx.translate(-4, 4);
  ctx.rotate((wingAngle * Math.PI) / 180);
  const wingGrad = ctx.createLinearGradient(0, -6, 0, 6);
  wingGrad.addColorStop(0, "#7A5A10");
  wingGrad.addColorStop(1, "#5C4310");
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Wing feather detail
  ctx.strokeStyle = "rgba(90, 60, 10, 0.5)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.quadraticCurveTo(-2, -3, 4, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, 2);
  ctx.quadraticCurveTo(0, -1, 6, 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
