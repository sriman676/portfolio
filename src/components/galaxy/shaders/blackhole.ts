// Schwarzschild black hole, ray traced per pixel (GALAXY §1.1). Same equations as src/lib/physics/blackhole.ts:
// x'' = -1.5 h² x / r⁵ (r_s = 1), thin-disk T ∝ r^-3/4 (1 - √(r_in/r))^1/4, Doppler × gravitational shift,
// I ∝ (gT/T_peak)⁴, linearised blackbody colour. Rendered on the front faces of a bounding sphere around the hole.

export const BOUND_RADIUS = 13; // outside the disk (r_out 11) and the lensing zone (b < 7.5)

export const blackHoleVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const blackHoleFragment = /* glsl */ `
precision highp float;
#define MAX_STEPS 260
#define BOUND ${BOUND_RADIUS.toFixed(1)}

uniform float uTime;
uniform int uSteps;
uniform float uLensing;      // 1 = draw lensed background stars (high tier), 0 = let the real starfield show
uniform float uRIn;
uniform float uROut;
uniform float uPeakK;
uniform float uExposure;
uniform float uTransmission;
varying vec3 vWorld;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = hash(vec3(i, 0.0)), b = hash(vec3(i + vec2(1.0, 0.0), 0.0));
  float c = hash(vec3(i + vec2(0.0, 1.0), 0.0)), d = hash(vec3(i + vec2(1.0, 1.0), 0.0));
  return a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) { v += amp * noise(p); p *= 2.03; amp *= 0.5; }
  return v;
}

// Helland's fit to the Planck locus, temperature in K -> linear-ish RGB chromaticity
vec3 blackbody(float k) {
  float t = clamp(k, 1000.0, 40000.0) / 100.0;
  float r = t <= 66.0 ? 1.0 : clamp(1.29293618606 * pow(t - 60.0, -0.1332047592), 0.0, 1.0);
  float g = t <= 66.0 ? clamp(0.39008157876 * log(t) - 0.63184144378, 0.0, 1.0)
                      : clamp(1.12989086089 * pow(t - 60.0, -0.0755148492), 0.0, 1.0);
  float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.54320678911 * log(t - 10.0) - 1.19625408914, 0.0, 1.0));
  return vec3(r, g, b);
}
// Helland's fit returns sRGB-encoded values; light math (and the tone map below) needs linear light.
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

float diskShape(float r) {
  return r <= uRIn ? 0.0 : pow(r / uRIn, -0.75) * pow(1.0 - sqrt(uRIn / r), 0.25);
}

vec3 diskEmission(vec3 p, vec3 photonDir) {
  float r = length(p.xz);
  vec3 phiHat = vec3(-p.z, 0.0, p.x) / r;                 // prograde orbit
  float cosTheta = dot(phiHat, -photonDir);               // emitter velocity vs ray to the observer
  float beta = sqrt(1.0 / (2.0 * (r - 1.0)));             // circular-orbit speed, static frame
  float gamma = inversesqrt(1.0 - beta * beta);
  float g = sqrt(1.0 - 1.0 / r) / (gamma * (1.0 - beta * cosTheta));
  float peakShape = diskShape(uRIn * 49.0 / 36.0);
  float t = uPeakK * diskShape(r) / peakShape;
  float omega = inversesqrt(2.0 * r * r * r);             // Keplerian angular velocity
  float angle = atan(p.z, p.x) - omega * uTime;
  float streaks = 0.55 + 0.9 * fbm(vec2(r * 1.6, angle * 6.0 / 3.14159265 + r * 0.35));
  float fade = clamp((uROut - r) / 2.5, 0.0, 1.0);
  float intensity = pow(g * t / uPeakK, 4.0) * streaks * fade; // frequency-integrated: (gT)⁴, not g³T⁴
  return srgbToLinear(blackbody(g * t)) * intensity * uExposure;
}

vec3 stars(vec3 d) {
  vec3 p = d * 180.0;
  vec3 cell = floor(p);
  if (hash(cell) > 0.0035) return vec3(0.0);
  float b = pow(max(0.0, 1.0 - length(p - cell - 0.5) * 2.2), 2.0) * 1.4;
  return srgbToLinear(blackbody(3000.0 + hash(cell.zxy) * 12000.0)) * b;
}

void main() {
  // Back faces are drawn, so this works with the camera outside or inside the bounding sphere (the dive-in intro).
  vec3 rd = normalize(vWorld - cameraPosition);
  float b0 = dot(cameraPosition, rd);
  float c0 = dot(cameraPosition, cameraPosition) - BOUND * BOUND;
  vec3 x = c0 > 0.0 ? cameraPosition + rd * max(-b0 - sqrt(max(b0 * b0 - c0, 0.0)), 0.0) : cameraPosition;
  vec3 v = rd;
  vec3 hv = cross(x, v);
  float h2 = dot(hv, hv);
  vec3 col = vec3(0.0);
  float transmit = 1.0;
  bool captured = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    if (i >= uSteps) break;
    float r2 = dot(x, x);
    float r = sqrt(r2);
    if (r < 1.0) { captured = true; break; }
    if (r > BOUND + 0.5 && dot(x, v) > 0.0) break;
    float dt = clamp(0.09 * r, 0.01, 1.5);
    vec3 a = -1.5 * h2 * x / (r2 * r2 * r);
    vec3 nx = x + v * dt + 0.5 * a * dt * dt;              // velocity Verlet
    float nr2 = dot(nx, nx);
    vec3 na = -1.5 * h2 * nx / (nr2 * nr2 * sqrt(nr2));
    vec3 nv = v + 0.5 * (a + na) * dt;
    if (x.y * nx.y < 0.0) {
      vec3 p = mix(x, nx, x.y / (x.y - nx.y));
      float rp = length(p.xz);
      if (rp >= uRIn && rp <= uROut) {
        col += transmit * diskEmission(p, normalize(nv));
        transmit *= uTransmission;
      }
    }
    x = nx;
    v = nv;
  }
  float alpha = 1.0 - transmit;
  if (captured) {
    alpha = 1.0;                                           // the shadow: nothing comes back
  } else if (uLensing > 0.5) {
    // Lensed background only for strongly bent rays (impact parameter b = |h| near the Einstein ring), fading to
    // fully transparent well inside the bounding sphere so the real starfield shows with no visible edge.
    float lens = smoothstep(7.5, 4.0, sqrt(h2));
    col += transmit * stars(normalize(v)) * lens;
    alpha += transmit * lens;
  }
  // Reinhard tone map + gamma, premultiplied alpha (same transfer as the still image)
  gl_FragColor = vec4(pow(col / (1.0 + col), vec3(1.0 / 2.2)), clamp(alpha, 0.0, 1.0));
}
`;
