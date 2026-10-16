import { describe, expect, it } from "vitest";
import { HERO_CAMERA } from "@/lib/hero-scene";
import { EMERGE_AT, FALL_END, ORBIT_END, introShot, type IntroShot } from "@/lib/intro";

const shot = (p: number) => introShot(p, {} as IntroShot);
const radius = (s: IntroShot) => Math.hypot(s.x, s.y, s.z);

describe("scroll intro camera (GALAXY §2.2)", () => {
  it("starts on the still's hero framing with the profile readable, then hides it once the dive starts", () => {
    const s = shot(0);
    expect(radius(s)).toBeCloseTo(Math.hypot(...HERO_CAMERA.position), 5);
    expect(s.z).toBeLessThan(0);
    expect(s).toMatchObject({ hint: 1, text: 1, tidal: 0, whiteout: 0, centered: 0 });
    expect(s.shiftX).toBeGreaterThan(0); // hole on the right, like the still
    expect(introShot(0, {} as IntroShot, 390 / 844).shiftX).toBe(0); // portrait stacks instead
    expect(shot(0.2)).toMatchObject({ text: 0, shiftX: 0 });
  });

  it("orbits around the hole before falling", () => {
    const mid = shot(ORBIT_END / 2);
    expect(Math.abs(mid.x)).toBeGreaterThan(5); // swung off the starting axis
    expect(shot(ORBIT_END - 0.001).y).toBeGreaterThan(shot(0).y); // risen above the disk plane
  });

  it("falls monotonically toward the horizon while tidal stretch and tunnel vision grow", () => {
    let last = Infinity;
    for (let p = ORBIT_END; p < FALL_END; p += 0.02) {
      const r = radius(shot(p));
      expect(r).toBeLessThanOrEqual(last + 1e-9);
      last = r;
    }
    const deep = shot(FALL_END - 0.001);
    expect(radius(deep)).toBeLessThan(1);
    expect(deep.tidal).toBeGreaterThan(0.9);
    expect(deep.fov).toBeLessThan(30);
  });

  it("whites out at the horizon and hides the cut to the far side", () => {
    expect(shot(FALL_END).whiteout).toBeCloseTo(1, 5);
    expect(shot(EMERGE_AT).whiteout).toBeCloseTo(1, 5);
    expect(shot(0.95).whiteout).toBe(0);
  });

  it("after emerging keeps the hole clear of the panel: below it on wide screens, above it on portrait", () => {
    expect(introShot(1, {} as IntroShot, 16 / 9).lookY).toBeGreaterThan(0);
    expect(introShot(1, {} as IntroShot, 390 / 844).lookY).toBeLessThan(0);
    expect(introShot(0.3, {} as IntroShot, 390 / 844).lookY).toBe(0); // only after emerging
  });

  it("emerges into a wide galaxy view with the intro panel shown", () => {
    const s = shot(1);
    expect(radius(s)).toBeGreaterThan(100);
    expect(s).toMatchObject({ text: 1, tidal: 0, centered: 1 });
  });
});
