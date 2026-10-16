// Instanced star quads (GALAXY §1 background, §3 warp). Each star is a camera-facing quad; uVelocity (view space,
// set by the warp in Phase 4.5) stretches the quad into a streak along the projected travel direction.

export const starsVertex = /* glsl */ `
attribute vec3 aOffset;
attribute vec3 aColor;
attribute float aSize;
uniform vec3 uVelocity;
uniform float uTidal;
uniform float uPixelRatio;
uniform float uTime;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  vec4 mv = viewMatrix * modelMatrix * vec4(aOffset, 1.0);
  vec3 vel = mat3(viewMatrix) * uVelocity;
  float speed = length(vel.xy);
  vec2 along = speed > 1e-4 ? normalize(vel.xy) : vec2(0.0, 1.0);
  // Spaghettification (intro): stretch radially toward the black hole at the origin.
  vec2 toHole = (viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xy - mv.xy;
  if (uTidal > 0.001 && dot(toHole, toHole) > 1e-6) {
    along = normalize(toHole);
    speed = max(speed, uTidal * 0.6);
  }
  vec2 across = vec2(along.y, -along.x); // keeps the quad counter-clockwise (front-facing)
  float size = aSize * uPixelRatio;
  // stretch along the travel direction during warps (speed is 0 at rest, so stars stay points)
  vec2 corner = position.x * across * size + position.y * along * size * (1.0 + speed * 40.0);
  mv.xy += corner * (-mv.z) * 0.006; // ≈ 3–4 px quads at the hero framing
  gl_Position = projectionMatrix * mv;
  float twinkle = 0.85 + 0.15 * sin(uTime * 1.3 + aOffset.x * 0.37 + aOffset.y * 0.71);
  vColor = aColor * twinkle;
  vUv = position.xy;
}
`;

export const starsFragment = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  float d = length(vUv);
  float core = pow(max(0.0, 1.0 - d * 2.0), 3.0); // bright point with a short falloff
  gl_FragColor = vec4(vColor * core, core);
}
`;
