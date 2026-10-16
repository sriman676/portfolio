import { describe, expect, it } from "vitest";
import { Governor, LADDER, rungSettings, startRung } from "@/lib/governor";
import { pickTier } from "@/lib/tier";

/** Feed frames at a fixed FPS for a duration; returns the end time. */
function run(g: Governor, fps: number, fromMs: number, forMs: number, warping = false) {
  const dt = 1000 / fps;
  let t = fromMs;
  for (; t < fromMs + forMs; t += dt) g.sample(dt, t, warping);
  return t;
}

describe("governor (GALAXY §12)", () => {
  it("ignores the first 2 s and frames during warps", () => {
    const g = new Governor("high");
    run(g, 20, 0, 1999);
    expect(g.name).toBe("full");
    run(g, 20, 2000, 6000, true);
    expect(g.name).toBe("full");
  });

  it("steps down one rung after 3 s below 50 FPS, then keeps stepping while slow", () => {
    const g = new Governor("high");
    const t = run(g, 60, 0, 2500);
    run(g, 35, t, 3600);
    expect(g.name).toBe("no-lensing");
    run(g, 35, t + 3600, 3600);
    expect(g.name).toBe("dpr-1");
  });

  it("never steps down from paused on-demand renders, and a slow streak doesn't resume across a pause", () => {
    const g = new Governor("high");
    let t = run(g, 60, 0, 2500);
    t = run(g, 8, t, 60_000, true); // hero off screen: sparse renders while the reader scrolls
    expect(g.name).toBe("full");
    t = run(g, 35, t, 2000); // slow for 2 s…
    t = run(g, 8, t, 5000, true); // …pause…
    run(g, 35, t, 2000); // …slow for 2 s again: never 3 s in a row
    expect(g.name).toBe("full");
  });

  it("jumps straight to DPR 1 when the GPU is far behind (< 25 FPS for 1.5 s)", () => {
    const g = new Governor("high");
    const t = run(g, 60, 0, 2500);
    run(g, 8, t, 3200);
    expect(g.name).toBe("dpr-1");
  });

  it("ignores a long gap from a hidden tab, and only jumps when < 25 FPS itself lasts 1.5 s", () => {
    const g = new Governor("high");
    let t = run(g, 60, 0, 2500);
    g.sample(60_000, t + 60_000); // tab came back after a minute
    t = run(g, 60, t + 60_000, 3000);
    expect(g.name).toBe("full");
    t = run(g, 45, t, 1400); // slow, not critical
    t = run(g, 15, t, 600); // briefly critical: one normal step at most, no jump to DPR 1
    expect(LADDER.indexOf(g.name)).toBeLessThan(LADDER.indexOf("dpr-1"));
  });

  it("recovers after 10 s above 58 FPS but never above the starting rung", () => {
    const g = new Governor("medium");
    let t = run(g, 60, 0, 2500);
    t = run(g, 30, t, 3600);
    expect(g.name).toBe("low");
    // Low is terminal: the 3D layer is gone, so nothing recovers it.
    expect(rungSettings(g.rung).tier).toBe("low");
    const h = new Governor("high");
    t = run(h, 60, 0, 2500);
    t = run(h, 45, t, 5000);
    expect(h.rung).toBe(startRung("high") + 1);
    t = run(h, 60, t, 12_000);
    expect(h.name).toBe("full");
    run(h, 60, t, 12_000);
    expect(h.name).toBe("full");
  });

  it("maps rungs to settings", () => {
    expect(rungSettings(0)).toMatchObject({ lensing: true, maxDpr: 1.75, starScale: 1, tier: "high" });
    expect(rungSettings(LADDER.indexOf("no-lensing")).lensing).toBe(false);
    expect(rungSettings(LADDER.indexOf("stars-half"))).toMatchObject({ maxDpr: 1, starScale: 0.5 });
  });
});

describe("tier detection (SPEC §5.3)", () => {
  const desktop = { reducedMotion: false, saveData: false, webgl2: true, cores: 12, memoryGb: 8, finePointer: true, width: 1440 };
  it("gives a strong desktop the high tier", () => expect(pickTier(desktop)).toBe("high"));
  it("drops to low for reduced motion, save-data or no WebGL2", () => {
    expect(pickTier({ ...desktop, reducedMotion: true })).toBe("low");
    expect(pickTier({ ...desktop, saveData: true })).toBe("low");
    expect(pickTier({ ...desktop, webgl2: false })).toBe("low");
  });
  it("gives phones and weaker machines medium, very weak devices low", () => {
    expect(pickTier({ ...desktop, finePointer: false, width: 390, cores: 8 })).toBe("medium");
    expect(pickTier({ ...desktop, cores: 4, memoryGb: 4 })).toBe("medium");
    expect(pickTier({ ...desktop, cores: 2 })).toBe("low");
  });
});
