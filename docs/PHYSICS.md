# PHYSICS — custom lightweight engine + 7 interactions

**Decision:** no third-party physics engine (no Rapier, cannon, ammo, or WebAssembly). A small custom module
in `src/lib/physics/` handles gravity, inertia, springs, orbits and soft sphere collisions. Space only needs
spheres. This keeps the bundle small, keeps the CSP strict, and avoids v2's crash path.

## 1. Engine core (`src/lib/physics/`)
| File | Responsibility |
|---|---|
| `world.ts` | Fixed-timestep loop: `dt = 1/120 s` with an accumulator, max 5 substeps per frame (drop the excess on long frames, never spiral). It's driven by the shared R3F `useFrame`, not its own RAF. |
| `bodies.ts` | Struct-of-arrays storage (`Float32Array` for position, velocity, mass, radius, flags). Preallocated capacity, **zero allocations per frame**. Static bodies (black hole, planets, host star, stations) and dynamic bodies (ship, flung asteroids). |
| `integrate.ts` | Semi-implicit (symplectic) Euler: update velocity first, then position. It keeps orbits stable. |
| `gravity.ts` | Softened inverse-square: `a = G·M·r / (|r|² + ε²)^1.5`, applied only within each body's influence radius. Static bodies attract dynamic ones only (no n² between dynamic bodies). |
| `springs.ts` | Critically damped springs (`k`, `c = 2√(k·m)`), used for asteroids returning to orbit and camera follow |
| `collide.ts` | Sphere vs sphere: push out along the normal, reflect the normal velocity × restitution (0.3), and dampen tangential velocity slightly. **Nothing ever "dies"**: soft bounces only. |
| `orbit.ts` | Orbit capture and release (§3.5) and circular-orbit helpers |
| `guard.ts` | Every step: if any value is NaN/Infinity or beyond world bounds, reset that body to its last safe state and count it in dev telemetry. Plus a speed cap and sleeping for bodies at rest. |
| `params.ts` | All tunables in one typed object (G, ε, caps, restitution, spring constants), with the dev-only `?physics=debug` panel to tune them live |

**Budget:** physics CPU ≤ ~1 ms/frame on desktop and ≤ ~2 ms on mid phones (approximate targets; measure them
and report). Particle-level effects (§3.1, §3.4, §3.6, §3.7) run **in shaders via uniforms**, not on the CPU.

## 2. Input layer (`src/lib/physics/input.ts`)
- Pointer events on the canvas, with a `three.Raycaster` against simplified collision spheres (not meshes).
  Only interactive objects are raycast.
- Pointer and touch are unified. Grab threshold: 6 px of movement or 120 ms of hold, so normal scrolling and
  taps still work.
- **Interactions never block content:** HTML panels stay above the canvas and keep their own clicks. Interactions
  are paused while a panel, the terminal or a dialog is focused.
- All 7 interactions are **decorative**. Every piece of content stays reachable without them, so keyboard and
  screen-reader users lose nothing. Free-flight already has full keyboard controls.

## 3. The seven interactions
| # | Interaction | How it works | Tier / device |
|---|---|---|---|
| 1 | **Cursor gravity well** | A uniform `uWell = (x, y, z, strength)` drives the star/dust vertex shader, which offsets each particle toward the cursor with a softened falloff. The strength eases in on move and out when idle. | High + medium, desktop. Touch: well follows the finger while it's down |
| 2 | **Fling asteroids** | Grab a cert asteroid, which becomes a dynamic body. Release velocity = recent pointer velocity (last 80 ms, clamped). It tumbles (angular velocity from the throw), then a critically damped spring pulls it back to its orbit slot within ~3 s. Asteroids collide softly with each other. | All tiers with 3D, touch included |
| 3 | **Spin planets** | Dragging across a planet adds angular velocity around the axis perpendicular to the drag. It decays with damping (`ω *= e^{-1.2·dt}`). A quick tap still selects or opens the planet. | All tiers with 3D, touch included |
| 4 | **Black-hole pull** | Within the black hole's influence: dust particles stretch radially in the shader (spaghettification, stretch ∝ 1/r²), ambient animation `timeScale` eases down to 0.85 (time-dilation feel; physics `dt` is unchanged), and the cursor well and ship get real gravity. | High + medium |
| 5 | **Ship flight physics** | In free-flight: thrust adds acceleration (no direct position setting), inertia comes from integration, gravity comes from every static body in range, soft collisions bounce, and there's a speed cap with an optional brake (`X`). **Orbit capture:** below capture speed inside a planet's capture radius with no thrust for 0.8 s, the ship eases into a circular orbit with a visual "orbit locked" HUD hint, and any thrust releases it. **Slingshot:** passing close to the black hole naturally boosts speed via gravity. An extra ×1.15 kick is applied inside the slingshot band at closest approach, with a streak flash. | Desktop only (free-flight is desktop-only) |
| 6 | **Comet trails react** | The tail direction in the shader = away from the black hole + a bend toward the ship/cursor when it's within range (`uDisturb`), springing back after. | High + medium |
| 7 | **Click ripples** | Clicking empty space starts a ripple: uniform `uRipple = (origin, t0)` with a radial wave offset in the star shader, at speed ~40 u/s, lasting 1.2 s. Up to 3 concurrent ripples (ring buffer). | All tiers with 3D, touch: tap empty space |

**Reduced motion: all 7 off.** The low tier has no 3D, so none apply there. Interactions pause during warps
and the intro.

## 4. Feel targets (tuning checklist; owner signs off in the Phase 4.8 report)
- Flinging feels weighty, not floaty. The asteroid returns smoothly without overshooting more than once.
- Spinning a planet feels like a heavy globe: a few seconds of coast.
- The cursor well is noticeable but subtle. It never distracts from reading a panel.
- Ship: responsive thrust, a satisfying drift, and orbit capture that feels like a reward, not a trap.
- Slingshot: clearly faster coming out than going in.

## 5. Tests (vitest, Node, no WebGL needed)
- **Orbit stability:** a body in a circular orbit stays within ±2% of its radius over 10 orbits.
- **Energy drift:** total energy drift < 1% over 60 s in a bound two-body test.
- **No tunneling:** at max ship speed, a collision with the smallest planet is always detected (substeps).
- **Guard:** an injected NaN gets reset, and no NaN ever leaves `world.step`.
- **Determinism:** the same initial state + same inputs → bit-identical state after 1,000 steps.
- **Spring settle:** a flung asteroid returns within 3 s ±0.5 s and overshoots ≤ 1 time.
- **Capture:** a slow approach without thrust results in capture, and thrust releases it.
- **Zero allocation:** `world.step` allocates nothing (check with a heap snapshot or by counting `new` in a test
  harness; describe the method).
