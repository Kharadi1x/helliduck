// Synthesize a quack sound using Web Audio API — no audio files needed
let audioCtx: AudioContext | null = null;

export function quack() {
  if (typeof window === "undefined") return;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const ctx = audioCtx;
  const now = ctx.currentTime;

  // Oscillator for the "quack" tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);

  // Dispatch custom event so the header duck knows to animate
  window.dispatchEvent(new CustomEvent("helliduck:quack"));
}
