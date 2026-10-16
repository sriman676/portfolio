// Scroll intro (GALAXY §2.2): orbit → spaghettification → through the horizon → emerge into the galaxy.
// Pure function of scroll progress p ∈ [0, 1]; writes into a caller-owned object (no allocation per frame).
import { HERO_CAMERA } from "./hero-scene";

export interface IntroShot {
  x: number; y: number; z: number; // camera position (black hole at the origin, r_s = 1)
  lookY: number; // camera looks at (0, lookY, 0)
  fov: number; // vertical, degrees
  shiftX: number; // 0..1 of the width: the hole is drawn this far right of centre (the hero layout)
  tidal: number; // 0..1 radial star stretch toward the hole
  whiteout: number; // 0..1 flash while crossing the horizon
  text: number; // 0..1 opacity of the profile panel
  centered: number; // 1 once emerged: the panel sits in the centre (it moves while hidden, so no visible slide)
  hint: number; // 0..1 opacity of "Scroll to enter"
}

export const ORBIT_END = 0.45;
export const FALL_END = 0.82;
export const EMERGE_AT = 0.85;

const DEG = Math.PI / 180;
const [hx, hy, hz] = HERO_CAMERA.position;
// Start exactly on the still's hero framing, so the 3D takes over from it without a jump.
const START_RADIUS = Math.hypot(hx, hy, hz);
const START_ELEVATION = Math.atan2(hy, Math.hypot(hx, hz)) / DEG;
const ORBIT_RADIUS = 16;
const HORIZON_GAP = 0.6; // inside the horizon (r < 1): every ray is captured, so the view is black under the flash
const HERO_SHIFT = 0.17; // wide screens: hole centre at 67 % of the width, where the still sits (globals.css .void)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** aspect = width / height. After emerging, portrait aims lower (hole above the text), wide aims higher (hole below the centred panel). */
export function introShot(p: number, out: IntroShot, aspect = 16 / 9): IntroShot {
  p = clamp01(p);
  out.lookY = 0;
  let radius: number;
  let azimuth: number; // around the y axis; 0 = looking from −z (the hero framing)
  let elevation: number;
  out.tidal = 0;
  out.fov = 40;
  if (p < ORBIT_END) {
    const t = smooth(0, 1, p / ORBIT_END);
    radius = START_RADIUS - (START_RADIUS - ORBIT_RADIUS) * t;
    azimuth = -120 * t;
    elevation = START_ELEVATION + (27 - START_ELEVATION) * t;
  } else if (p < EMERGE_AT) {
    const t = clamp01((p - ORBIT_END) / (FALL_END - ORBIT_END));
    const fall = t * t; // accelerating plunge
    radius = ORBIT_RADIUS - (ORBIT_RADIUS - HORIZON_GAP) * fall;
    azimuth = -120 - 90 * t; // spiralling in
    elevation = 27 - 19 * t;
    out.tidal = fall; // tidal stretch ∝ 1/r³ grows sharply near the hole
    out.fov = 40 - 14 * t; // tunnel vision as we fall
  } else {
    // Emerged on the far side: a wide view of the galaxy with the hole clear of the panel.
    radius = 140;
    azimuth = 30;
    elevation = 18;
    out.fov = 45;
    out.lookY = aspect < 1 ? -48 : 30;
  }
  const a = azimuth * DEG;
  const e = elevation * DEG;
  out.x = radius * Math.cos(e) * Math.sin(a);
  out.y = radius * Math.sin(e);
  out.z = -radius * Math.cos(e) * Math.cos(a);
  out.shiftX = aspect >= 1 ? HERO_SHIFT * (1 - smooth(0, 0.12, p)) : 0;
  out.whiteout = smooth(FALL_END - 0.06, FALL_END, p) * (1 - smooth(EMERGE_AT + 0.01, EMERGE_AT + 0.07, p));
  // Recruiter-first: the profile is readable on arrival, fades as the dive starts, and returns after emerging.
  out.text = 1 - smooth(0.01, 0.08, p) + smooth(0.88, 0.97, p);
  out.centered = p >= EMERGE_AT ? 1 : 0;
  out.hint = 1 - smooth(0, 0.06, p);
  return out;
}

/** Shared between the scroll listener and the render loop (mutated in place, never reallocated). */
export const introState = { progress: 0, tidal: 0 };
