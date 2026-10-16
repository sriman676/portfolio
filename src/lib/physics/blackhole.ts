// Schwarzschild black-hole optics (GALAXY §1.1). Units: Schwarzschild radius r_s = 1, c = 1.
// Shared by the GLSL shader (same equations), scripts/render-hero-still.mjs and the unit tests.

export const R_ISCO = 3; // innermost stable circular orbit, 3 r_s
export const R_PHOTON = 1.5; // photon sphere
export const B_CRIT = Math.sqrt(27) / 2; // critical impact parameter = shadow radius ≈ 2.598 r_s

export type Vec3 = [number, number, number];

export interface DiskHit { x: number; y: number; z: number; r: number; dir: Vec3 }
export interface RayResult { captured: boolean; dir: Vec3; hits: DiskHit[] }

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

/**
 * Null geodesic in Schwarzschild written in Cartesian form: x'' = -1.5 · h² · x / r⁵, with h = |x × x'|
 * conserved. This reproduces the exact photon orbit equation u'' + u = 1.5 u² (u = 1/r). Integrated with RK4
 * and a step proportional to r. Records every crossing of the equatorial disk plane between rIn and rOut.
 */
export function traceRay(origin: Vec3, direction: Vec3, opts: { rIn?: number; rOut?: number; rEscape?: number; maxSteps?: number } = {}): RayResult {
  const { rIn = R_ISCO, rOut = 12, rEscape = 60, maxSteps = 4000 } = opts;
  let x: Vec3 = [...origin];
  let v: Vec3 = norm(direction);
  const h = cross(x, v);
  const h2 = dot(h, h);
  const acc = (p: Vec3): Vec3 => {
    const r2 = dot(p, p);
    const k = (-1.5 * h2) / (r2 * r2 * Math.sqrt(r2));
    return [p[0] * k, p[1] * k, p[2] * k];
  };
  const hits: DiskHit[] = [];
  for (let i = 0; i < maxSteps; i++) {
    const r = Math.hypot(x[0], x[1], x[2]);
    if (r < 1) return { captured: true, dir: norm(v), hits };
    if (r > rEscape && dot(x, v) > 0) return { captured: false, dir: norm(v), hits };
    const dt = Math.min(Math.max(0.02 * r, 0.005), 2);
    // RK4 on (x, v)
    const a1 = acc(x);
    const x2: Vec3 = [x[0] + v[0] * dt / 2, x[1] + v[1] * dt / 2, x[2] + v[2] * dt / 2];
    const v2: Vec3 = [v[0] + a1[0] * dt / 2, v[1] + a1[1] * dt / 2, v[2] + a1[2] * dt / 2];
    const a2 = acc(x2);
    const x3: Vec3 = [x[0] + v2[0] * dt / 2, x[1] + v2[1] * dt / 2, x[2] + v2[2] * dt / 2];
    const v3: Vec3 = [v[0] + a2[0] * dt / 2, v[1] + a2[1] * dt / 2, v[2] + a2[2] * dt / 2];
    const a3 = acc(x3);
    const x4: Vec3 = [x[0] + v3[0] * dt, x[1] + v3[1] * dt, x[2] + v3[2] * dt];
    const v4: Vec3 = [v[0] + a3[0] * dt, v[1] + a3[1] * dt, v[2] + a3[2] * dt];
    const a4 = acc(x4);
    const nx: Vec3 = [0, 1, 2].map((j) => x[j]! + (dt / 6) * (v[j]! + 2 * v2[j]! + 2 * v3[j]! + v4[j]!)) as Vec3;
    const nv: Vec3 = [0, 1, 2].map((j) => v[j]! + (dt / 6) * (a1[j]! + 2 * a2[j]! + 2 * a3[j]! + a4[j]!)) as Vec3;
    if (x[1] * nx[1] < 0) {
      const t = x[1] / (x[1] - nx[1]);
      const p: Vec3 = [x[0] + (nx[0] - x[0]) * t, 0, x[2] + (nx[2] - x[2]) * t];
      const rp = Math.hypot(p[0], p[2]);
      if (rp >= rIn && rp <= rOut) hits.push({ x: p[0], y: 0, z: p[2], r: rp, dir: norm(nv) });
    }
    x = nx;
    v = nv;
  }
  return { captured: false, dir: norm(v), hits };
}

/** Local orbital speed (units of c) of a circular geodesic orbit, measured by a static observer. */
export function orbitalBeta(r: number): number {
  return Math.sqrt(1 / (2 * (r - 1)));
}

/** Relativistic Doppler factor D = 1 / (γ (1 − β cos θ)), θ between emitter velocity and the ray to the observer. */
export function dopplerFactor(beta: number, cosTheta: number): number {
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return 1 / (gamma * (1 - beta * cosTheta));
}

/** Gravitational redshift factor for light climbing from radius r to infinity. */
export function gravitationalRedshift(r: number): number {
  return Math.sqrt(1 - 1 / r);
}

/** Total frequency shift g = ν_obs/ν_emit for disk gas at radius r whose velocity makes angle θ with the ray. */
export function diskShift(r: number, cosTheta: number): number {
  return dopplerFactor(orbitalBeta(r), cosTheta) * gravitationalRedshift(r);
}

/** Thin-disk (Novikov–Thorne / Shakura–Sunyaev) shape: T ∝ r^(-3/4) · (1 − √(r_in/r))^(1/4); 0 at r_in. */
function diskShape(r: number, rIn: number): number {
  return r <= rIn ? 0 : Math.pow(r / rIn, -0.75) * Math.pow(1 - Math.sqrt(rIn / r), 0.25);
}
// The profile peaks at r = (49/36) r_in; normalising by that value makes tPeak the hottest temperature.
const PEAK_SHAPE = diskShape((49 / 36) * R_ISCO, R_ISCO);

/** Emitted disk temperature (K) at radius r, scaled so the hottest ring is tPeak. */
export function diskTemperature(r: number, tPeak = 7000, rIn = R_ISCO): number {
  return (tPeak * diskShape(r, rIn)) / PEAK_SHAPE;
}

/**
 * Frequency-integrated brightness of disk gas, relative to the hottest ring: (gT/T_peak)⁴. I_ν/ν³ is invariant, so
 * I_ν ∝ g³ and integrating over frequency adds one more g (docs/VERIFICATION.md 5b-i); equally, Stefan–Boltzmann at gT.
 */
export function diskBrightness(g: number, kelvin: number, tPeak: number): number {
  return ((g * kelvin) / tPeak) ** 4;
}

/** sRGB-encoded channel (0–1) → linear light, for doing light math on blackbodyRGB output (IEC 61966-2-1 curve). */
export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Blackbody colour for a temperature in K (Helland's fit), each channel 0–1, **sRGB-encoded** (display values). */
export function blackbodyRGB(kelvin: number): Vec3 {
  const t = Math.min(Math.max(kelvin, 1000), 40000) / 100;
  const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
  const r = t <= 66 ? 1 : clamp(1.29293618606 * Math.pow(t - 60, -0.1332047592));
  const g = t <= 66 ? clamp(0.39008157876 * Math.log(t) - 0.63184144378) : clamp(1.12989086089 * Math.pow(t - 60, -0.0755148492));
  const b = t >= 66 ? 1 : t <= 19 ? 0 : clamp(0.54320678911 * Math.log(t - 10) - 1.19625408914);
  return [r, g, b];
}
