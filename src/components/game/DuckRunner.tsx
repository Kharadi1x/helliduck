"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CANVAS_W = 600;
const CANVAS_H = 300;
const GROUND_Y = 240;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const DUCK_W = 40;
const DUCK_H = 40;

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "rock" | "fence" | "bird";
}

type GameState = "idle" | "playing" | "dead";

export default function DuckRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const stateRef = useRef({
    duckY: GROUND_Y - DUCK_H,
    velocity: 0,
    crouching: false,
    obstacles: [] as Obstacle[],
    score: 0,
    frameCount: 0,
    speed: 4,
    gameState: "idle" as GameState,
    nextSpawn: 60,
    legFrame: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("helliduck-runner-highscore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const startOrJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === "idle" || s.gameState === "dead") {
      s.duckY = GROUND_Y - DUCK_H;
      s.velocity = 0;
      s.crouching = false;
      s.obstacles = [];
      s.score = 0;
      s.frameCount = 0;
      s.speed = 4;
      s.gameState = "playing";
      s.nextSpawn = 60;
      setGameState("playing");
      setScore(0);
    }
    if (s.gameState === "playing" && s.duckY >= GROUND_Y - DUCK_H - 1) {
      s.velocity = JUMP_FORCE;
    }
  }, []);

  const setCrouch = useCallback((val: boolean) => {
    stateRef.current.crouching = val;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        startOrJump();
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setCrouch(true);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowDown") setCrouch(false);
    }
    function handleClick() {
      startOrJump();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleClick);

    let animId: number;

    function gameLoop() {
      const s = stateRef.current;
      // Sky
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Ground
      ctx.fillStyle = "#333";
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_W, GROUND_Y);
      ctx.stroke();

      if (s.gameState === "idle") {
        drawRunnerDuck(ctx, 80, GROUND_Y - DUCK_H, false, 0);
        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Duck Runner", CANVAS_W / 2, 80);
        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Space/Click to jump, Down to crouch", CANVAS_W / 2, 110);
      } else if (s.gameState === "playing") {
        s.frameCount++;
        s.score = Math.floor(s.frameCount / 6);
        setScore(s.score);

        // Speed ramp
        s.speed = 4 + s.frameCount * 0.002;

        // Physics
        s.velocity += GRAVITY;
        s.duckY += s.velocity;
        if (s.duckY > GROUND_Y - DUCK_H) {
          s.duckY = GROUND_Y - DUCK_H;
          s.velocity = 0;
        }

        // Spawn obstacles
        s.nextSpawn--;
        if (s.nextSpawn <= 0) {
          const roll = Math.random();
          let obs: Obstacle;
          if (roll < 0.4) {
            obs = { x: CANVAS_W, y: GROUND_Y - 25, w: 30, h: 25, type: "rock" };
          } else if (roll < 0.75) {
            obs = { x: CANVAS_W, y: GROUND_Y - 40, w: 20, h: 40, type: "fence" };
          } else {
            obs = { x: CANVAS_W, y: GROUND_Y - 70 - Math.random() * 30, w: 30, h: 20, type: "bird" };
          }
          s.obstacles.push(obs);
          s.nextSpawn = 50 + Math.random() * 60;
        }

        // Update obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          s.obstacles[i].x -= s.speed;
          if (s.obstacles[i].x + s.obstacles[i].w < 0) {
            s.obstacles.splice(i, 1);
          }
        }

        // Draw obstacles
        for (const obs of s.obstacles) {
          if (obs.type === "rock") {
            ctx.fillStyle = "#666";
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.h);
            ctx.lineTo(obs.x + obs.w / 2, obs.y);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
            ctx.closePath();
            ctx.fill();
          } else if (obs.type === "fence") {
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(obs.x + 7, obs.y, 6, obs.h);
            ctx.fillRect(obs.x, obs.y + 8, 20, 5);
            ctx.fillRect(obs.x, obs.y + obs.h - 12, 20, 5);
          } else {
            // bird
            ctx.fillStyle = "#888";
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // wings
            const wingFlap = Math.sin(s.frameCount * 0.3) * 8;
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x + 5, obs.y + obs.h / 2);
            ctx.lineTo(obs.x - 5, obs.y + obs.h / 2 - wingFlap);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.w - 5, obs.y + obs.h / 2);
            ctx.lineTo(obs.x + obs.w + 5, obs.y + obs.h / 2 - wingFlap);
            ctx.stroke();
          }
        }

        // Duck
        const duckH = s.crouching ? DUCK_H * 0.6 : DUCK_H;
        const duckDrawY = s.crouching ? s.duckY + DUCK_H * 0.4 : s.duckY;
        s.legFrame = s.frameCount;
        drawRunnerDuck(ctx, 80, duckDrawY, s.crouching, s.legFrame);

        // Collision
        const duckRect = {
          left: 80 + 5,
          right: 80 + DUCK_W - 5,
          top: duckDrawY + 5,
          bottom: duckDrawY + duckH - 5,
        };

        for (const obs of s.obstacles) {
          if (
            duckRect.right > obs.x &&
            duckRect.left < obs.x + obs.w &&
            duckRect.bottom > obs.y &&
            duckRect.top < obs.y + obs.h
          ) {
            die();
            break;
          }
        }

        // Score
        ctx.fillStyle = "white";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "right";
        ctx.fillText(String(s.score).padStart(5, "0"), CANVAS_W - 20, 30);
      } else if (s.gameState === "dead") {
        // Draw final state
        for (const obs of s.obstacles) {
          ctx.fillStyle = obs.type === "rock" ? "#666" : obs.type === "fence" ? "#8B4513" : "#888";
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }
        drawRunnerDuck(ctx, 80, s.duckY, false, 0);

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", CANVAS_W / 2, CANVAS_H / 2 - 30);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 5);

        ctx.fillStyle = "#888";
        ctx.font = "14px Arial";
        ctx.fillText("Click or Space to restart", CANVAS_W / 2, CANVAS_H / 2 + 35);
      }

      animId = requestAnimationFrame(gameLoop);
    }

    function die() {
      const s = stateRef.current;
      s.gameState = "dead";
      setGameState("dead");
      if (s.score > highScore) {
        setHighScore(s.score);
        localStorage.setItem("helliduck-runner-highscore", String(s.score));
      }
    }

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleClick);
    };
  }, [startOrJump, setCrouch, highScore]);

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
          Space/Click to jump, Down Arrow to crouch
        </p>
      )}
    </div>
  );
}

function drawRunnerDuck(ctx: CanvasRenderingContext2D, x: number, y: number, crouching: boolean, frame: number) {
  ctx.save();
  ctx.translate(x, y);

  const h = crouching ? DUCK_H * 0.6 : DUCK_H;

  // Legs (animated)
  ctx.fillStyle = "#FF8F00";
  const legSwing = Math.sin(frame * 0.3) * 4;
  ctx.fillRect(12 + legSwing, h - 6, 3, 8);
  ctx.fillRect(22 - legSwing, h - 6, 3, 8);

  // Body
  const bodyGrad = ctx.createRadialGradient(DUCK_W / 2, h / 2, 2, DUCK_W / 2, h / 2, DUCK_W / 2);
  bodyGrad.addColorStop(0, "#8B6914");
  bodyGrad.addColorStop(1, "#6B4F12");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(DUCK_W / 2, h / 2, DUCK_W / 2.2, h / 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headGrad = ctx.createRadialGradient(DUCK_W - 8, 6, 1, DUCK_W - 8, 6, 10);
  headGrad.addColorStop(0, "#2E8B57");
  headGrad.addColorStop(1, "#1B6B3A");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(DUCK_W - 8, crouching ? 8 : 6, 9, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(DUCK_W - 3, crouching ? 6 : 4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(DUCK_W - 2, crouching ? 6 : 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(DUCK_W - 1, crouching ? 5 : 3, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#FF8F00";
  ctx.beginPath();
  ctx.moveTo(DUCK_W, crouching ? 8 : 6);
  ctx.quadraticCurveTo(DUCK_W + 10, crouching ? 5 : 3, DUCK_W + 8, crouching ? 10 : 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
