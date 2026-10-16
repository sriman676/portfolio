import type { Tier } from "./tier";

/**
 * GALAXY §12 quality ladder, best first, holding only rungs that change something today: a rung with no effect
 * would just cost 3 s of slow frames. Add the DoF, grain, bloom and nebula rungs in spec order when they exist.
 */
export const LADDER = ["full", "no-lensing", "dpr-1", "stars-half", "medium", "low"] as const;
export type Rung = (typeof LADDER)[number];

const at = (rung: Rung) => LADDER.indexOf(rung);

/** Starting rung for a load-time tier. */
export function startRung(tier: Tier): number {
  return tier === "high" ? 0 : tier === "medium" ? at("medium") : at("low");
}

/** What a rung means for rendering. */
export function rungSettings(index: number) {
  return {
    lensing: index < at("no-lensing"),
    maxDpr: index >= at("dpr-1") ? 1 : 1.75,
    starScale: index >= at("stars-half") ? 0.5 : 1,
    tier: (index >= at("low") ? "low" : index >= at("medium") ? "medium" : "high") as Tier,
  };
}

const WINDOW_MS = 2000;
const WARMUP_MS = 2000;
const SLOW_FPS = 50;
const SLOW_FOR_MS = 3000;
const FAST_FPS = 58;
const FAST_FOR_MS = 10000;
const CRITICAL_FPS = 25;
const CRITICAL_FOR_MS = 1500;
const MAX_FRAME_MS = 250;
const DPR_ONE = at("dpr-1");
const CAPACITY = 512;

/**
 * Runtime quality governor: rolling 2 s frame-time average, ignoring the first 2 s and frames during warps.
 * Sustained < 50 FPS for 3 s steps down one rung; > 58 FPS for 10 s steps up, never above the starting rung.
 * Fixed-size ring buffer: no allocations per frame.
 */
export class Governor {
  rung: number;
  private readonly best: number;
  private readonly times = new Float64Array(CAPACITY);
  private readonly durations = new Float64Array(CAPACITY);
  private head = 0;
  private size = 0;
  private sum = 0;
  private startedAt = -1;
  private slowSince = -1;
  private criticalSince = -1;
  private fastSince = -1;

  constructor(tier: Tier) {
    this.best = startRung(tier);
    this.rung = this.best;
  }

  /** Feed one frame. `paused` frames (a warp, or on-demand renders while the hero is off screen) don't count. Returns true when the rung changed. */
  sample(frameMs: number, now: number, paused = false): boolean {
    if (this.startedAt < 0) this.startedAt = now;
    if (paused) {
      // Gaps between on-demand renders aren't GPU load, and a slow streak must not resume across them.
      this.slowSince = this.criticalSince = this.fastSince = -1;
      return false;
    }
    if (now - this.startedAt < WARMUP_MS || this.rung >= LADDER.length - 1) return false;
    // A frame this long is a paused tab or an on-demand render, not GPU load: ignore it.
    if (frameMs > MAX_FRAME_MS) return false;
    this.push(now, frameMs);
    while (this.size > 0 && now - this.times[(this.head - this.size + CAPACITY) % CAPACITY]! > WINDOW_MS) this.shift();
    const fps = 1000 / (this.sum / this.size);
    this.slowSince = fps < SLOW_FPS ? (this.slowSince < 0 ? now : this.slowSince) : -1;
    this.criticalSince = fps < CRITICAL_FPS ? (this.criticalSince < 0 ? now : this.criticalSince) : -1;
    this.fastSince = fps > FAST_FPS ? (this.fastSince < 0 ? now : this.fastSince) : -1;
    // Emergency: a GPU this far behind (e.g. a high-DPR screen) skips straight to DPR 1 instead of creeping down.
    if (this.criticalSince >= 0 && now - this.criticalSince >= CRITICAL_FOR_MS && this.rung < DPR_ONE) {
      return this.move(DPR_ONE - this.rung);
    }
    if (this.slowSince >= 0 && now - this.slowSince >= SLOW_FOR_MS) return this.move(1);
    if (this.fastSince >= 0 && now - this.fastSince >= FAST_FOR_MS && this.rung > this.best) return this.move(-1);
    return false;
  }

  get name(): Rung {
    return LADDER[this.rung]!;
  }

  get fps(): number {
    return this.size ? 1000 / (this.sum / this.size) : 0;
  }

  private move(step: number): boolean {
    this.rung += step;
    this.size = 0;
    this.sum = 0;
    this.slowSince = -1;
    this.criticalSince = -1;
    this.fastSince = -1;
    return true;
  }

  private push(time: number, ms: number) {
    if (this.size === CAPACITY) this.shift();
    this.times[this.head] = time;
    this.durations[this.head] = ms;
    this.head = (this.head + 1) % CAPACITY;
    this.size++;
    this.sum += ms;
  }

  private shift() {
    const tail = (this.head - this.size + CAPACITY) % CAPACITY;
    this.sum -= this.durations[tail]!;
    this.size--;
  }
}
