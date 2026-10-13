# GALAXY — the 3D space experience (governs SPEC §5)

Level **C**: a 3D black-hole hero, a scroll journey through a galaxy where every portfolio section is its own
celestial region, light-speed warps from the terminal, and an opt-in free-flight mode. The HTML content is
always underneath, complete, and readable without WebGL.

## 0. Guardrails (lessons from v2, which crashed)
- **No third-party physics engine.** Camera and scripted motion are kinematic (splines, `MathUtils.damp`;
  verify the helper names in the installed `.d.ts`). Interactive physics uses only the custom module in
  `docs/PHYSICS.md`.
- One `<Canvas>` for the whole site, mounted once in the root layout and never remounted on route change.
  Postprocessing mounts only after the first rendered frame confirms the GL context.
- Error boundary around the Canvas → falls back to the static star image + the 2D galaxy map (§7). Handle
  `webglcontextlost` (pause + show fallback) and `webglcontextrestored` (rebuild).
- No per-frame allocations, instanced meshes, single RAF, pause when hidden or off-screen, DPR clamp.
- Free-flight is **opt-in** (Launch button / `fly` command). The default is the scroll journey.

## 1. Galaxy layout (each section = its own element)
World units are arbitrary, so scale them during tuning. All positions are generated **deterministically** from
content at build time (`scripts/layout-galaxy.mjs` → `src/data/galaxy.json`). The same content always gives the
same galaxy.

| Region | Element | Built from | Data | Visual rules |
|---|---|---|---|---|
| Hero / identity | **Black hole** at origin | `person` | name, pitch | Shader accretion disk (rotating, Doppler-brightened side), photon ring, screen-space lensing on the high tier, dark horizon sphere. Slow, hypnotic. |
| Experience | **Space stations** orbiting the black hole | `experience[]` | one station per role | Procedural: torus ring + spokes + hub + blinking nav lights. Slow orbit, tidally locked. |
| Research | **Nebula cluster** | `items[kind=paper]` | one star per paper | Volumetric-looking fbm sprites (layered billboards, not raymarching). Paper stars inside are colored by status. |
| Projects | **Planetary system** around a host star | `items[kind=project]` | one planet per project | Size from `featured`, color from status. Procedural noise surface + atmosphere rim. GitHub-only repos are small distant planets. Orbits follow `ordering`. |
| Skills | **Spiral arms** | `skills[]` groups | one arm per group | Instanced star streams. Faint lines from each skill to every planet/star that uses it (the old constellation edges). |
| Certifications | **Asteroid belt** | `certs[]` | one asteroid per cert | Instanced, low-poly displaced icosahedrons. Earned = soft glow, in-progress = dim. |
| Lab notes | **Comets** | `notes[]` | one comet per note | Head + particle tail pointing away from the black hole. Hidden while there are no notes. |
| Contact | **Signal beacon** at the rim | `links` | contact actions | Antenna mast + pulsing ring wave every ~2 s. |
| GitHub inbox items | Faint new stars | synced repos | — | A brief ignition flare the first time a visitor sees a new one (localStorage last-seen). |
| Teju mode | Hidden **heart nebula** | — | — | Only spawned by Teju mode (TEJU_MODE.md). Never in the layout file. |

Background: 3 parallax star layers + 1 faint galactic dust band. These are the stars that streak during warps.

### 1.1 Physical accuracy (owner decision, INTAKE Q-003; overrides artistic approximations above)
- **Black hole (Schwarzschild):** shadow radius √27·GM/c² (≈ 2.6 r_s), photon ring at 1.5 r_s, disk from the ISCO
  (3 r_s) outward, thin-disk temperature T ∝ r^-3/4 → blackbody colour, Doppler beaming (intensity × D³) and
  gravitational redshift √(1 − r_s/r). High tier: per-pixel ray bending in the shader (numerical geodesic steps), so
  the far side of the disk shows above and below the shadow.
- **Warp:** relativistic aberration cos θ' = (cos θ + β)/(1 + β cos θ) (stars crowd forward) and relativistic
  Doppler colour shift (blue ahead, red behind), layered on the §3 streaks; β ramps 0 → ~0.99 during the jump.
- **Bodies:** Lambert + Fresnel-rim lighting from the host star, Rayleigh-style atmosphere scattering on near-LOD
  planets, star colours from blackbody temperatures (≈ 3,000–30,000 K), orbits obey Kepler's third law (T ∝ a^1.5).
- **Low tier / WebGL off:** `scripts/render-hero-still.mjs`, a pure-Node ray tracer (no WebGL, no dependency) using
  the same equations, renders the hero still; the owner runs it and commits the image (replaces the §6 "verify
  approach" note).
- The governor (§12) still steps effects down to keep the FPS bars.

## 2. Scroll journey (default on every device)
- A camera spline through **stops** in this order: Black hole → Stations → Research nebula → Planetary system →
  Spiral-arms wide shot → Asteroid belt → Comets (if any) → Beacon.
- Scroll progress maps to spline progress (damped). Each stop has a "dwell" zone where the camera holds and
  the matching **HTML section** (real DOM, server-rendered) fades in beside the object. Between stops the
  panels fade out.
- The HTML is in normal document order and fully readable with 3D off. 3D only adds the camera and the
  fades. Use a sticky full-viewport canvas + normal-flow sections. Verify drei `ScrollControls` vs. a custom
  scroll listener; prefer whichever keeps native scrolling and accessibility (no scroll-jacking).
- Lenis smooth scroll (SPEC §3.3, owner decision) is allowed: it keeps the native scroll position, so it is not
  scroll-jacking. Desktop only, off under reduced motion, paused while overlays are open, never on touch.
- Keyboard/scroll-spy/side-nav jumps call the same **warp** (§3) in its gentle variant.
- First screen on desktop: the black hole fills the view, with name + pitch + TL;DR + résumé/email buttons on
  top. Scroll hint: "Scroll to travel · ⌘K for commands".

### 2.1 World first, one screen (owner decision 2026-10-13, reference: bruno-simon.com)
- **One screen, one scrollbar.** The canvas fills the whole viewport behind everything; nothing on the page
  scrolls on its own (no inner scrollbars). The page has exactly one scrollbar, and scrolling it flies the
  camera (§2 above).
- **World mode (default when the tier allows 3D):** landing shows only the full-screen galaxy with the name +
  pitch overlay. The B "Console" identity rail is not shown as a column; its content appears as the first
  holographic panel at the black hole, and each later section appears as a panel anchored to its region
  (GALAXY §10 layer 6). An **Explore** button switches to free-flight (§5) for Bruno-style exploring.
- **Page mode:** a persistent **"Read as page"** button switches to the approved B "Console" layout (sticky
  rail + content column, `docs/DESIGN_DECISION.md`) with the galaxy dimmed behind it; "Back to the galaxy"
  returns. The choice is remembered in `localStorage` (`view.mode`, try/catch). Page mode is also the forced
  view for the low tier, WebGL failure, reduced motion and no-JS, so recruiters and crawlers always get the
  complete HTML (CLAUDE.md rule 1).
- Both modes render the same server HTML; switching modes only changes CSS and the camera, never content.
- Builds in Phases 3 (canvas behind everything), 4.5 (world-mode panels on scroll) and 4.9 (holographic panels).

## 3. Warp system (light-speed travel)
`warpTo(target, { variant })`. A single store action (zustand) used by the terminal, side nav, scroll-spy,
deep links, the minimap and free-flight clicks.

**Timeline** (first warp in a session ≈ 1.5 s, later warps ≈ 0.8 s, any key/tap skips to arrival):
| Beat | Share | Effect |
|---|---|---|
| Spool | 15% | Stars ease back slightly. A faint charge glow at the screen edges |
| Jump | 45% | **Stars stretch from points to streak lines** along the travel direction (stretch the instanced star quads in the vertex shader by velocity; no new geometry). FOV widens about 10°, plus slight radial blur on the high tier |
| Drop-out | 15% | Streaks snap back to points, with a small flash at the center |
| Arrive + enter | 25% | Destination-specific **entry effect** (below), then the content panel opens |

**Entry effects per region**
| Target | Entry effect |
|---|---|
| Black hole | Light bends around the horizon (lensing strength ramps), then the hero panel |
| Station | Camera flies through the docking ring, interior lights come on, then the experience panel in a station-HUD style |
| Nebula / paper | Dives into the fog (fog density ramps), then the paper's star brightens and the paper panel opens |
| Planet | Drops into orbit, the planet turns to face the camera, then the case-study panel |
| Spiral arms | Pull-back to the wide galaxy shot, then the skill lines light up |
| Asteroid belt | Weaves past 2–3 asteroids, then lands next to the cert asteroid |
| Comet | Matches the comet's speed alongside its tail, then the note panel |
| Beacon | The pulse ring expands past the camera, then the contact panel |

**Variants:** `cinematic` (terminal, deep links: the timeline above), `gentle` (scroll-spy/nav: no streaks, an
eased camera move ≈ 0.6 s), `instant` (reduced motion: crossfade only).
**Mobile:** always ≈ 0.8 s, streaks on medium tier and above only.
**Interrupts:** a new `warpTo` mid-warp retargets smoothly. Never queue.

## 4. Terminal ↔ warp integration
- On a command with a 3D destination (owner decision, 2026-10-13, replaces the earlier "slim bar, then reopen"):
  1. **Genie minimize** (~450 ms): the terminal pours into the "Type a command ⌘K" button (desktop rail; the
     bottom command bar on phones), macOS-style. Built with GSAP + an animated CSS `clip-path` curve + scale on
     the real DOM (no WebGL, no extra library).
  2. The button becomes the warp status: `warping → <target>…` with a skip control, while the light-speed warp
     (§3) plays.
  3. **Arrival:** the region's entry effect plays and its content panel opens; focus moves to the panel heading.
     The terminal **stays minimized**; the button now reads `docked at: <region>` (e.g. `docked at: research
     nebula`). Clicking it or pressing ⌘K reverses the genie and reopens the terminal with the `docked at:` line in
     the scrollback.
  - An `aria-live="polite"` region announces "Warping to <target>" and "Docked at <region>".
  - Reduced motion: no genie, no streaks; the terminal closes instantly, the `instant` warp variant runs, the
    button text still updates.
- Command → target map:
  | Command | Target |
  |---|---|
  | `whoami`, `home`, `cd ~` | Black hole |
  | `experience`, `cd experience` | Stations (first station; `experience <org>` for a specific one) |
  | `papers`, `research`, `open <paper>` | Nebula / that paper's star |
  | `projects`, `open <project>` | Planetary system / that planet |
  | `skills` | Spiral arms |
  | `certs` | Asteroid belt |
  | `notes`, `open <note>` | Comets / that comet |
  | `contact`, `email` | Beacon (`email` still copies the address too) |
  | `galaxy`, `map` | Wide shot with the minimap open |
  | `fly` | Starts free-flight (desktop only; on mobile prints "Free-flight is desktop-only. Try `map`.") |
- Commands with no destination (`help`, `neofetch`, `clear`, `history`…) don't warp.
- `open <item>` warps, *then* the case-study panel's "Full write-up" link goes to `/work/<slug>`.

## 5. Free-flight mode (desktop, opt-in)
- Entered via the Launch button (hero), the `fly` command, or `/galaxy?fly=1`. Exit with Esc or the button.
- Controls: WASD/arrows to move, mouse drag to look, Shift to boost, Space/C for up/down, click any body to
  warp to it, and `M` to toggle the minimap. A controls card shows on first entry.
- Motion: real custom physics (docs/PHYSICS.md §3.5): thrust, inertia, gravity from every body, soft
  collisions, orbit capture and slingshot. Speed cap and brake.
- Bodies are proximity-aware: when near one, its label and "Enter ↵" appear. Enter runs that region's entry
  effect + panel.
- HUD (minimal, DOM over canvas): speed, nearest body, minimap (2D top-down of `galaxy.json`), and an
  "explored N / M" counter.
- Pointer lock is optional (verify the API). Never trap the user: Esc always exits.

## 6. Mobile & tiers
| Tier | Gets |
|---|---|
| High (desktop GPU) | Everything: lensing, bloom, radial blur, full star count, free-flight |
| Medium | No lensing/blur/bloom, fewer stars, streak warps, free-flight on desktop |
| Low / mobile weak / `saveData` | Pre-rendered still of the black hole hero (generated at build from the real scene, verify approach) + 2D galaxy map. Warps = crossfades |
| Phones (medium+) | Scroll journey + tap-to-warp from the map/nav. **No free-flight.** Warps ≈ 0.8 s |
| Reduced motion | Static hero still, no streaks, no camera flight. Sections behave like a normal page |
Tier detection and FPS-based downgrade as in SPEC §5.3.

## 7. Fallback: 2D galaxy map
An SVG top-down map of `galaxy.json` with the same regions, icons and labels, all real buttons. Used for the
low tier, WebGL failure, and as the minimap. Clicking a body scrolls to the HTML section.

## 8. Performance budget (approximate; measure in Phase 3, then fix the numbers)
- HTML-path First Load JS: unchanged (3D is lazy).
- 3D chunks (owner decision, INTAKE Q-002): **no single fixed cap.** 3D is split by tier and loaded on need: low
  tier 0 kB; medium = core galaxy chunk; high adds a separate post-processing chunk; free-flight, physics and Teju
  mode are their own on-use chunks. Each chunk's measured gzipped size is recorded in `budgets.json` in Phase 3; CI
  fails if a chunk grows > 10% over its recorded size, and the owner approves any intentional raise.
- Desktop high tier ≥ 60 FPS during warps. Mobile medium ≥ 30 FPS on the scroll journey.
- Time to first black-hole frame on desktop broadband: target ≤ ~2.5 s (record it).

## 10. Immersion layers (Phase 4.9)
**No sound effects anywhere** (owner decision). Immersion comes from visuals and motion only. The single
exception is Teju mode's music (TEJU_MODE §4).

| # | Layer | Spec |
|---|---|---|
| 1 | **Cinematic intro** | First visit per device only (localStorage `intro.seen`, try/catch). ≈ 3 s: the camera falls in from deep space, the stars thin out, and the black hole grows and settles onto the hero framing. Skip on any key, click, tap or scroll, with a visible "Skip intro" button. HTML hero text is in the DOM from the first paint (the intro never hides content from crawlers or screen readers). Reduced motion or the low tier: no intro. |
| 2 | **Shader warm-up** | During the intro (or idle on return visits), precompile every material and post-effect (`renderer.compile(scene, camera)` or drei's precompile helper; verify the API) and pre-upload instanced buffers, so the first warp never stutters. Acceptance: first warp frame time ≤ 2× the median (measure it). |
| 3 | **Living world** | Nothing is ever static: planets self-rotate, the accretion disk swirls, stations blink nav lights, comets travel their paths, the nebula drifts slowly, and a shooting star crosses every 8–20 s (random, deterministic seed per session). All of it runs on the shared clock, with zero allocations. On idle with `frameloop: demand` it still runs at a low tick (e.g. 30 fps) on high/medium. Off on the low tier and with reduced motion. |
| 4 | **Parallax** | Desktop: the camera sways ≤ 1.5° toward the cursor (damped). Mobile: gyro tilt via `DeviceOrientationEvent` (iOS 13+ needs `requestPermission()` from a user tap; verify). Offer a "Tilt to look" chip once, only if supported. Off with reduced motion. |
| 5 | **Cinematic post-processing** | High tier only, via `@react-three/postprocessing` (verify effect names): bloom, subtle film grain, vignette, chromatic aberration that ramps only during warps, and depth of field focused on the current stop's object during dwells. Medium: vignette only. Keep it subtle. Text legibility over 3D must still pass AA (panels have their own backdrop). |
| 6 | **Holographic panels** | Content panels are styled as HUD projections anchored beside their object: thin border with corner brackets, faint scanline, slight tilt toward the camera. They're **real DOM** positioned over the canvas (drei `Html` or a projected screen-space anchor; verify), not text in WebGL, so they stay selectable, translatable and screen-reader accessible. On mobile they become bottom sheets. |
| 7 | **Seamless transitions** | Navigating between `/`, `/work/[slug]`, `/notes/*` and `/galaxy` never remounts the canvas (the root layout owns it). A route change triggers `warpTo` the matching body (gentle variant). Use the View Transitions API for the DOM crossfade where supported (verify Next 15 support / pattern), else a CSS fade. Browser back = warp back. |
| 8 | **Fullscreen** | Free-flight HUD has a fullscreen toggle (Fullscreen API; verify), `F` key. Esc exits fullscreen first, then free-flight. |
| 9 | **Haptics** | Android only: `navigator.vibrate(12)` on warp drop-out and docking (feature-detect; iOS Safari doesn't support it). Off with reduced motion. |
| 10 | **Immersion playtest** | Owner runs §11 before launch. |

## 11. Immersion playtest checklist (owner, desktop + phone)
- [ ] All 7 physics interactions feel right (PHYSICS §4 feel targets)
- [ ] First visit: the intro plays, is skippable instantly, and never shows on the second visit
- [ ] First warp has no hitch (also check the frame-time report)
- [ ] Scrolling start to finish: never a moment where nothing on screen is moving (high/medium tier)
- [ ] Every terminal destination: streak jump → drop-out → the correct entry effect → panel
- [ ] The terminal genie-minimizes into the ⌘K button, shows `docked at:` on arrival, and reopens from it
- [ ] Panels are readable over every region (bright nebula and bloom included)
- [ ] Cursor parallax feels subtle, not floaty. Phone tilt works after allowing it
- [ ] `/work/feddecept` → back: warps both ways, the canvas never flashes or reloads
- [ ] Free-flight: inertia feels good, Enter docks, fullscreen works, Esc exits cleanly
- [ ] Shooting stars appear, comets move, planets turn
- [ ] Low-end phone: correct downgrade, still feels alive, no overheating after 3 min
- [ ] Reduced motion (OS setting on): no intro, no streaks, no flight, the site is fully usable
- [ ] WebGL off: complete HTML + 2D map
- [ ] No sound anywhere (except Teju music)
- [ ] Recruiter path: from landing to résumé download in ≤ 2 clicks, with or without 3D

## 12. LOD + render budget manager (Phases 3–4)
- **Level of detail per body type**, switched by screen-space size (projected radius in px, not raw distance):
  | Body | Near (> ~120 px) | Mid (~20–120 px) | Far (< ~20 px) |
  |---|---|---|---|
  | Planets | High-segment sphere + noise surface shader + atmosphere | Low-segment sphere, simpler shader, no atmosphere | Single instanced sprite (glow dot) |
  | Stations | Full procedural model + blinking lights | Simplified ring + hub | Sprite |
  | Asteroids | Displaced icosahedron (detail 1) | Detail 0 | Instanced point |
  | Nebula | All billboard layers | Half the layers | One layer |
  Thresholds are approximate starting values; tune them in Phase 4 and report the final numbers. Use crossfades or
  hysteresis (±15%) so bodies don't flicker between levels. Verify drei's `Detailed`/LOD helpers vs a custom
  switch, and pick one.
- **Culling:** frustum culling on (three's default; confirm it isn't disabled on instanced meshes. For
  `InstancedMesh`, compute bounding spheres so whole batches cull). Regions far from the camera's current stop
  skip their `useFrame` updates entirely (an "active region" set from the journey/flight position).
- **Runtime quality governor** (extends SPEC §5.3; tiers are no longer fixed at load):
  - Sample the frame time continuously (rolling 2 s window, ignoring the first 2 s and frames during warps).
  - Sustained average < 50 FPS for 3 s → step down one rung. Sustained > 58 FPS for 10 s → step up one rung (never
    above the device's starting tier).
  - Ladder, top to bottom: full → drop DoF → drop chromatic aberration/grain → drop lensing → bloom half-res →
    no bloom → DPR 1.0 → star count −50% → nebula layers −50% → medium tier → low tier (still image + 2D map).
  - Every step is announced only in dev (console + `?perf=debug` overlay showing FPS, draw calls, triangles,
    current rung, physics ms). Never show this to visitors.
- **Budgets per frame on desktop high** (approximate; measure and finalize): ≤ ~150 draw calls, ≤ ~400k
  triangles visible. Report the actual numbers per region.

## 13. Real-user performance monitoring (Phase 12)
- Add **Vercel Speed Insights** (verify the package name, setup for Next 15 App Router, and what the Hobby plan
  includes; I'm not certain of its limits) for real-visitor Core Web Vitals per route.
- **Tier telemetry, without any custom write path:** if the plan supports Vercel Analytics custom events
  (verify), send one event per session `perf_tier` with only: starting tier, final governor rung, and coarse
  average-FPS bucket (`<30`, `30–50`, `50–58`, `58+`). No user agent string, no IDs, no terminal input. If custom
  events aren't available, skip it. **Don't build a custom endpoint** (CLAUDE.md rule 4).
- The `/security` page lists exactly what's collected.
- Owner workflow: check the Speed Insights + Analytics dashboards weekly for the first month after launch. If
  many sessions end on a low rung, tune the LOD thresholds or budgets.

## 9. Acceptance (cumulative over the galaxy phases)
- Every section has its element, generated from content. Adding a paper adds a nebula star with no code
  change.
- Every terminal destination command warps and docks correctly, with skip working.
- The terminal genie-minimizes into the ⌘K button during the warp, stays minimized on arrival with
  `docked at: <region>`, and reopens from the button or ⌘K. First warp ≈ 1.5 s, later ≈ 0.8 s.
- Free-flight works on desktop and is absent on phones. Esc always exits.
- With WebGL disabled, the HTML is complete and the 2D map works. A forced Canvas throw falls back without
  a page crash.
- Reduced motion: no streaks and no camera flight anywhere.
- LOD switches without visible popping, the governor recovers from a forced slowdown (simulated GPU
  throttle) by stepping down, and draw-call/triangle numbers are reported per region.
- Immersion layers (§10) all present on the high tier, correctly reduced per tier, and §11 checklist passed by the owner.
