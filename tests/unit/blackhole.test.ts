import { describe, expect, it } from "vitest";
import { B_CRIT, R_ISCO, blackbodyRGB, diskBrightness, diskShift, diskTemperature, srgbToLinear, traceRay } from "@/lib/physics/blackhole";

/** Fire a photon from far away along +z with impact parameter b (offset in x). */
const shoot = (b: number) => traceRay([b, 0, -400], [0, 0, 1], { rEscape: 600, rOut: 0 });

describe("Schwarzschild ray tracing", () => {
  it("captures photons inside the critical impact parameter and lets them escape outside it", () => {
    expect(B_CRIT).toBeCloseTo(2.598, 3);
    expect(shoot(B_CRIT * 0.98).captured).toBe(true);
    expect(shoot(B_CRIT * 1.02).captured).toBe(false);
  });

  it("matches the weak-field deflection 2 r_s / b far from the hole", () => {
    for (const b of [40, 80]) {
      const { dir } = shoot(b);
      const deflection = Math.atan2(-dir[0], dir[2]); // bends toward the hole (−x)
      expect(deflection / (2 / b)).toBeGreaterThan(0.95);
      expect(deflection / (2 / b)).toBeLessThan(1.08);
    }
  });

  it("bends light passing over the top down onto the far side of the disk", () => {
    // Flat space: y = 1 + 0.075 t only rises, so this ray would never touch the disk plane (y = 0).
    const res = traceRay([0, 1, -40], [0, 3 / 40, 1], { rOut: 12 });
    expect(res.hits.length).toBeGreaterThan(0);
    expect(res.hits[0]!.z).toBeGreaterThan(0); // behind the hole, as seen from the camera
    expect(res.hits.every((h) => h.r >= R_ISCO && h.r <= 12)).toBe(true);
  });
});

describe("disk emission", () => {
  it("is cold at the ISCO and peaks at the requested temperature", () => {
    expect(diskTemperature(R_ISCO)).toBe(0);
    let max = 0;
    for (let r = R_ISCO; r < 20; r += 0.01) max = Math.max(max, diskTemperature(r, 7000));
    expect(max).toBeCloseTo(7000, -1);
  });

  it("brightens and blueshifts the approaching side (Doppler) and redshifts the receding side", () => {
    const approaching = diskShift(5, 1);
    const receding = diskShift(5, -1);
    expect(approaching).toBeGreaterThan(1);
    expect(receding).toBeLessThan(1);
    const t = diskTemperature(5, 4300);
    const ratio = diskBrightness(approaching, t, 4300) / diskBrightness(receding, t, 4300);
    expect(ratio).toBeCloseTo((approaching / receding) ** 4, 9); // frequency-integrated beaming is g⁴
    expect(diskBrightness(1, 4300, 4300)).toBe(1);
  });

  it("linearises sRGB with the IEC 61966-2-1 curve", () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBeCloseTo(1, 12);
    expect(srgbToLinear(0.5)).toBeCloseTo(0.2140, 4);
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.04045 / 12.92, 12); // linear segment
  });

  it("maps temperatures to plausible star colours", () => {
    const [r3, , b3] = blackbodyRGB(3000);
    const [r10, , b10] = blackbodyRGB(10000);
    expect(r3).toBeGreaterThan(b3); // cool = red
    expect(b10).toBeGreaterThanOrEqual(r10); // hot = blue-white
  });
});
