#!/usr/bin/env node
// Renders the black-hole hero still with the same Schwarzschild ray tracing as the 3D shader (GALAXY §1.1).
// Used by the low tier, WebGL failure, reduced motion and no-JS, and as the placeholder before 3D loads.
// No WebGL, no dependencies. Owner runs it and commits the output:  node scripts/render-hero-still.mjs [width]
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { traceRay, diskTemperature, diskShift, diskBrightness, blackbodyRGB, srgbToLinear } from "../src/lib/physics/blackhole.ts";
import { HERO_CAMERA, DISK } from "../src/lib/hero-scene.ts";

const W = Number(process.argv[2] ?? 1600); // the committed public/hero-still.png is 1600 wide
const H = Math.round(W / HERO_CAMERA.aspect);
const out = new URL("../public/hero-still.png", import.meta.url);

// Camera basis: looking from `position` at the origin.
const [cx, cy, cz] = HERO_CAMERA.position;
const len = Math.hypot(cx, cy, cz);
const fwd = [-cx / len, -cy / len, -cz / len];
const right = norm(cross(fwd, [0, 1, 0]));
const up = cross(right, fwd);
const tanHalf = Math.tan((HERO_CAMERA.fov * Math.PI) / 360);

function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a) { const l = Math.hypot(...a); return a.map((n) => n / l); }

// Deterministic hash + value noise for disk turbulence and background stars.
function hash(x, y, z = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y) {
  let v = 0, amp = 0.5;
  for (let i = 0; i < 4; i++) { v += amp * noise(x, y); x *= 2.03; y *= 2.03; amp *= 0.5; }
  return v;
}

/** Same emission model as the shader: blackbody colour at the shifted temperature gT (linearised), brightness (gT/T_peak)⁴. */
function diskEmission(hit) {
  const phiHat = [-hit.z / hit.r, 0, hit.x / hit.r]; // prograde rotation seen from +y
  const toObserver = hit.dir.map((n) => -n);
  const cosTheta = phiHat[0] * toObserver[0] + phiHat[2] * toObserver[2];
  const g = diskShift(hit.r, cosTheta);
  const t = diskTemperature(hit.r, DISK.peakKelvin);
  const angle = Math.atan2(hit.z, hit.x);
  const streaks = 0.55 + 0.9 * fbm(hit.r * 1.6, angle * 6 / Math.PI + hit.r * 0.35);
  const fade = Math.min(1, (DISK.rOut - hit.r) / 2.5);
  const intensity = diskBrightness(g, t, DISK.peakKelvin) * streaks * Math.max(fade, 0);
  return blackbodyRGB(g * t).map((c) => srgbToLinear(c) * intensity * DISK.exposure);
}

function background(dir) {
  // Sparse stars on a direction grid; colour from a random temperature.
  const p = dir.map((n) => n * 180);
  const cell = p.map(Math.floor);
  if (hash(cell[0], cell[1], cell[2]) > 0.0035) return [0, 0, 0];
  const d = Math.hypot(...p.map((n, i) => n - cell[i] - 0.5));
  const b = Math.max(0, 1 - d * 2.2) ** 2 * 1.4;
  return blackbodyRGB(3000 + hash(cell[2], cell[0], cell[1]) * 12000).map((c) => srgbToLinear(c) * b);
}

const tone = (v) => Math.round(255 * Math.pow(v / (1 + v), 1 / 2.2)); // Reinhard + gamma
const rows = Buffer.alloc((W * 3 + 1) * H);
const started = Date.now();
for (let y = 0; y < H; y++) {
  rows[y * (W * 3 + 1)] = 0; // PNG filter: none
  for (let x = 0; x < W; x++) {
    const sx = ((2 * (x + 0.5)) / W - 1) * tanHalf * HERO_CAMERA.aspect;
    const sy = (1 - (2 * (y + 0.5)) / H) * tanHalf;
    const dir = norm([0, 1, 2].map((i) => fwd[i] + right[i] * sx + up[i] * sy));
    const res = traceRay(HERO_CAMERA.position, dir, { rIn: DISK.rIn, rOut: DISK.rOut });
    let color = res.captured ? [0, 0, 0] : background(res.dir);
    // Disk hits composite front to back; the disk is optically thick but slightly translucent at the edge.
    let transmit = 1;
    const acc = [0, 0, 0];
    for (const hit of res.hits) {
      const e = diskEmission(hit);
      for (let i = 0; i < 3; i++) acc[i] += transmit * e[i];
      transmit *= DISK.transmission;
    }
    color = color.map((c, i) => acc[i] + transmit * c);
    const o = y * (W * 3 + 1) + 1 + x * 3;
    rows[o] = tone(color[0]); rows[o + 1] = tone(color[1]); rows[o + 2] = tone(color[2]);
  }
}

// Minimal PNG writer (8-bit RGB).
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8-bit, RGB
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr), chunk("IDAT", deflateSync(rows, { level: 9 })), chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(out, png);
console.log(`hero-still.png ${W}×${H}, ${(png.length / 1024).toFixed(0)} kB, ${((Date.now() - started) / 1000).toFixed(1)} s`);
