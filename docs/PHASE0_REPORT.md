# Phase 0 — Preflight report (2026-10-13)

No app code written, nothing installed in the project. Versions from `npm view` on 2026-10-13. APIs verified by
reading the published `.d.ts`/source of each tarball (`npm pack` into a scratch dir) or the official docs (cited).
Local env: Node v24.15.0, npm 11.12.1, Windows 11.

## 1. Version table
| Package | Latest | Proposed | Source / note |
|---|---|---|---|
| next | 16.4.0 | **owner decision (Q-001)**: 16.4.0 or 15.5.27 | `npm view next`, `npm view next@15` (15.5.27 published 2026-09-30, still patched) |
| react / react-dom | 19.3.0 | 19.3.0 | R3F peer caps React `<19.4` |
| typescript | 7.0.2 | **5.9.3** | typescript-eslint 8.71.2 peer `typescript >=4.8.4 <6.1.0` → TS 7 breaks lint |
| eslint | 10.12.0 | **9.39.5** | eslint-plugin-react / jsx-a11y / import peers stop at `^9` |
| eslint-config-next | 16.4.0 | match `next` | peer `eslint >=9` (15.5.27: `^7‖^8‖^9`) |
| tailwindcss + @tailwindcss/postcss | 4.3.3 | 4.3.3 | |
| three / @types/three | 0.186.1 / 0.186.0 | same | |
| @react-three/fiber | 9.8.1 | 9.8.1 | peers `react >=19 <19.4`, `three >=0.156` |
| @react-three/drei | 10.7.9 | 10.7.9 | peers `react ^19`, `@react-three/fiber ^9.0.0`, `three >=0.159` |
| @react-three/postprocessing | 3.2.0 | 3.2.0 | peers `@react-three/fiber >=9.7.0`, `postprocessing ^6.36.0` |
| postprocessing | 6.39.5 | 6.39.5 | |
| gsap | 3.15.0 | 3.15.0 | license "Standard 'no charge' license"; ScrollTrigger, SplitText, Observer ship in the package |
| @gsap/react | 2.1.2 | 2.1.2 | peers `gsap ^3.12.5`, `react >=17` |
| lenis | 1.3.26 | 1.3.26 | peer `react >=17` (only for `lenis/react`) |
| zustand | 5.0.15 | 5.0.15 | |
| zod | 4.6.7 | 4.6.7 | |
| @upstash/redis | 1.39.0 | 1.39.0 | |
| @upstash/ratelimit | 2.2.0 | 2.2.0 | exists ✅; peer `@upstash/redis ^1.38.2` |
| @vercel/analytics | 2.0.1 | 2.0.1 | peer `next >=13` |
| @vercel/speed-insights | 2.0.0 | 2.0.0 | package name confirmed |
| @node-rs/argon2 | 2.2.2 | 2.2.2 | prebuilt `linux-x64-gnu` binary; in Next's built-in `server-external-packages` list (15 and 16) |
| vitest | 5.0.4 | 5.0.4 | engines Node `^22.12 ‖ ^24`; needs vite 8 |
| vite / @vitejs/plugin-react / jsdom | 8.3.4 / 6.1.2 / 30.1.2 | same | |
| @testing-library/react / dom | 16.3.3 / 10.4.2 | same | |
| @playwright/test | 1.64.0 | 1.64.0 | |
| @axe-core/playwright | 4.13.0 | 4.13.0 | package exists |
| @types/react, @types/react-dom, @types/node | 19.3.0, 19.3.0, 26.6.5 → **24.x** | match Node 24 runtime |
| qrcode | 1.5.4 | (Phase 11, verify API then) | |
| @next/bundle-analyzer | 16.4.0 | match `next` | |

## 2. Peer-dependency matrix
| | React 19.3 | R3F 9.8 | three 0.186 | Next 16.4 | Next 15.5 |
|---|---|---|---|---|---|
| R3F 9.8.1 | ✅ (`<19.4`) | — | ✅ | ✅ | ✅ |
| drei 10.7.9 | ✅ | ✅ (`^9`) | ✅ | ✅ | ✅ |
| r3f-postprocessing 3.2.0 | ✅ | ✅ (`>=9.7`) | ✅ | ✅ | ✅ |
| Next | ✅ (`^19.0.0`) | | | | |
Pin React to `~19.3.0` so a future 19.4 doesn't break the R3F peer.

## 3. API confirmations
| API | Result | Where verified |
|---|---|---|
| `unstable_cache` | ✅ exists in 15.5.27 and 16.4.0 | `dist/server/web/spec-extension/unstable-cache.d.ts` |
| `revalidateTag` | 15: `revalidateTag(tag)`. **16: `revalidateTag(tag, profile \| CacheLifeConfig)`**; use `{ expire: 0 }` from Route Handlers for immediate expiry. `updateTag` is Server-Action-only (throws in Route Handlers) | `revalidate.d.ts`; Next docs `revalidateTag.mdx`, `updateTag.mdx` (Context7) |
| `next/og` `ImageResponse` | ✅ `og.d.ts` in both | package root |
| Middleware | 15: `middleware.ts`. **16: renamed `proxy.ts`** (`PROXY_FILENAME`); matters for the Phase 12 nonce CSP | `dist/lib/constants.d.ts` |
| `next lint` | Removed in Next 16 → `npm run lint` = `eslint .` | Next 16 change; re-verify at scaffold |
| `@upstash/ratelimit` | `new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(n, "15 m") })`, `.limit(id)`, `fixedWindow`, `tokenBucket`, `ephemeralCache`. **Telemetry is on by default** → set `enableTelemetry: false`. `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_*` only, so `lib/kv.ts` maps `KV_REST_API_*` itself | tarball `index.d.ts` + README |
| Node `crypto.argon2` | Exists: added **v24.7.0**, `argon2(algorithm, { message, nonce, parallelism, tagLength, memory, passes }, cb)`, returns raw bytes (no PHC string). Stability marker not confirmed in the section I read | nodejs.org/api/crypto.html; `typeof crypto.argon2 === 'function'` on local v24.15.0 |
| Vercel Node runtime | 24.x selectable via `"engines": { "node": "24.x" }` (maps to latest 24 release) | Vercel docs `node-js-versions` (Context7) |
| OWASP Argon2id minimum | "19 MiB of memory, an iteration count of 2, and 1 degree of parallelism" (m=19456, t=2, p=1); alt m=47104, t=1. scrypt: N=2^17, r=8, p=1 | OWASP Password Storage Cheat Sheet (fetched today) |
| three `MathUtils.damp(x, y, lambda, dt)` | ✅ | `src/math/MathUtils.js:134` |
| `renderer.compile` / `compileAsync` | ✅ | `WebGLRenderer.js` |
| drei `Detailed`, `Html`, `ScrollControls`, `Preload`, `PerformanceMonitor`, `AdaptiveDpr`, `Instances`, `PointerLockControls` | ✅ all present | drei `core/*.d.ts`, `web/*.d.ts` |
| r3f-postprocessing `Bloom`, `Vignette`, `Noise`, `ChromaticAberration`, `DepthOfField`, `SMAA` | ✅ | `dist/effects/*.d.ts` |
| Lenis | `autoRaf`, `raf(time)`, `stop()`, `start()`, `scrollTo()`, `prevent(node)`, `syncTouch`, `on('scroll')`; README pattern: `gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)` | `dist/lenis.d.ts`, README |

**Password hashing pick: `@node-rs/argon2` 2.2.2.** Its `hash`/`verify` produce and check PHC strings directly with
configurable `memoryCost`/`timeCost`/`parallelism`/`outputLen`, it ships a Vercel-compatible prebuilt binary, and
Next already externalizes it. Built-in `crypto.argon2` works on Node 24.7+ but returns raw bytes, so we'd hand-write
PHC encoding/parsing plus constant-time compare, and its stability status is unconfirmed. Params:
m=19456, t=2, p=1, 32-byte output; raise memory in Phase 8 if login latency stays ≤ 500 ms.

## 4. Proposed `package.json` dependencies (assuming Next 16, Q-001)
```json
{
  "engines": { "node": "24.x" },
  "dependencies": {
    "next": "16.4.0",
    "react": "~19.3.0",
    "react-dom": "~19.3.0",
    "three": "0.186.1",
    "@react-three/fiber": "9.8.1",
    "@react-three/drei": "10.7.9",
    "@react-three/postprocessing": "3.2.0",
    "postprocessing": "6.39.5",
    "gsap": "3.15.0",
    "@gsap/react": "2.1.2",
    "lenis": "1.3.26",
    "zustand": "5.0.15",
    "zod": "4.6.7",
    "@upstash/redis": "1.39.0",
    "@upstash/ratelimit": "2.2.0",
    "@node-rs/argon2": "2.2.2",
    "@vercel/analytics": "2.0.1",
    "@vercel/speed-insights": "2.0.0"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/node": "24.x (exact at install)",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@types/three": "0.186.0",
    "tailwindcss": "4.3.3",
    "@tailwindcss/postcss": "4.3.3",
    "eslint": "9.39.5",
    "eslint-config-next": "16.4.0",
    "vitest": "5.0.4",
    "vite": "8.3.4",
    "@vitejs/plugin-react": "6.1.2",
    "jsdom": "30.1.2",
    "@testing-library/react": "16.3.3",
    "@testing-library/dom": "10.4.2",
    "@playwright/test": "1.64.0",
    "@axe-core/playwright": "4.13.0",
    "@next/bundle-analyzer": "16.4.0"
  }
}
```
Packages are added in the phase that first needs them (3D in Phase 3, Upstash/argon2 in Phase 8, etc.), each
re-checked with `npm view` at install time. `qrcode` is deferred to Phase 11.

## 5. Skills per phase (installed globally in `C:\Users\srima\.claude\skills`)
| Phase | Skills |
|---|---|
| 0 / planning | superpowers:brainstorming, superpowers:writing-plans, find-docs (ctx7), ecc:search-first |
| 0.5 | none (GitHub REST, unauthenticated) |
| 0.75 | frontend-design, impeccable, ui-ux-pro-max, hallmark, css-native |
| 1 | ecc:nextjs-turbopack, ecc:react-patterns, ecc:frontend-a11y, gsap-react, gsap-core, superpowers:test-driven-development |
| 2 | ecc:seo |
| 2.5 | setup-deploy, benchmark (owner triggers deploy) |
| 3–4.9 | threejs-* (11), gsap-timeline, gsap-scrolltrigger, gsap-performance, motion-principles, motion-design, ecc:react-performance |
| 4.8 | superpowers:test-driven-development, threejs-interaction |
| 5–7 | ecc:react-testing, ecc:e2e-testing, gsap-plugins (SplitText for the typewriter), motion-design |
| 8, 9, 12 | ecc:security-review + security-reviewer agent (mandatory), ecc:security-scan, cso, anthropic-skills:threat-modeling |
| 10 | ecc:api-design |
| 11 | impeccable, design-audit, design-review, ecc:accessibility |
| every phase end | ecc:typescript-reviewer, code-review, superpowers:verification-before-completion, ecc:git-workflow |
Not used: framer-motion (kept as reference only; GSAP replaces `motion`).

## 6. Conflicts, gaps, ambiguities
1. **Next 15 vs 16.** SPEC/PHASES say Next 15; latest stable is 16.4.0. 16 changes three things we touch:
   `revalidateTag(tag, { expire: 0 })`, `middleware.ts` → `proxy.ts` (nonce CSP), and `next lint` is gone. → **Q-001**
2. **TypeScript 7 is latest but unusable with typescript-eslint** (`<6.1`). Using 5.9.3, which matches the spec.
3. **ESLint 10 is latest but the React/a11y/import plugins only support ≤ 9.** Using 9.39.5.
4. **3D chunk budget:** GALAXY §8 "≤ ~350 kB" vs EXTRAS §7 "≤ ~250 kB" (CI fails at +10%). → **Q-002**
5. **FPS downgrade threshold:** SPEC §5.3 "sustained < 40 FPS" vs GALAXY §12 "< 50 FPS for 3 s". Proposal: GALAXY §12
   wins (it says it extends §5.3).
6. **TERMINAL §4:** `papers` is its own command (prints list) *and* an alias of `research` (warps). Proposal: `papers`
   prints the list and warps to the nebula (GALAXY §4 table already maps `papers` → nebula), `research` = alias.
7. **Low-tier still:** SPEC §5.3 says "static CSS star image", GALAXY §6 says "pre-rendered still of the black hole
   generated at build from the real scene". Build-time WebGL rendering needs headless Chromium in the build.
   Proposal: a `scripts/render-hero-still.mjs` Playwright script the owner runs and commits (like the résumé PDF),
   not part of `next build`. → **Q-003**
8. **Medium-tier vignette** (GALAXY §10.5) would load `@react-three/postprocessing` on medium, but SPEC §12 says
   "high tier only". Proposal: medium vignette = CSS radial-gradient overlay; postprocessing stays high-only.
9. **drei `ScrollControls`** uses its own scroll container (not native document scroll). GALAXY §2 asks for native
   scroll; proposal: custom listener via ScrollTrigger + Lenis, no `ScrollControls`.
10. **`check:intake` naming:** INTAKE.md says `npm run check:intake`, CLAUDE.md says `node scripts/check-intake.mjs`.
    Both will work (npm script wraps the node call).
11. **SPEC §13 file tree is incomplete**: missing `lib/order.ts`, `/notes`, `/resume`, `/security`, `security.txt`,
    the history/export/ordering/restore/draft routes (SECURITY §3.5), `proxy.ts`/`middleware.ts`. Treating the tree as
    non-exhaustive; the phase docs win.
12. **PHASES Phase 13** repeats "Teju mode works in prod." (typo, no action).
13. **Upstash ratelimit telemetry** defaults on; SPEC §10 says no PII. Will set `enableTelemetry: false`.
14. **Vercel Hobby limits** (custom events, UTM data, Speed Insights) remain unverified; vercel.com blocked direct
    fetch today. Deferred to Phases 11/12 as the spec already says.
15. **Phase 0.5 needs the repo published**: PHASES says CI and Vercel from 2.5 on, but there's no GitHub remote yet.
    Not blocking until Phase 2.5.
16. **Spec updated (owner decisions, 2026-10-13):** SPEC §3.3 and §12 (GSAP replaces `motion`; Lenis desktop-guarded;
    React Bits curated) and GALAXY §2 (Lenis is allowed).

## 7. Questions for the owner (carried into INTAKE.md §1)
- **Q-001** Next 16.4 (current, recommended: newest, longest support; three small API changes above) or Next 15.5
  (exactly as the spec says)?
- **Q-002** 3D budget: start at 350 kB (GALAXY) or 250 kB (EXTRAS)? Recommend 350 kB, then tighten after measuring in Phase 3.
- **Q-003** Low-tier hero still: owner-run Playwright render script (recommended), or a hand-made static image?
