# Cosmos v3 — Product & Technical Spec

## 1. Concept
**"Signal in deep space."** Sriman's work is a galaxy. The site opens on a 3D black hole (him), and
scrolling travels through regions where every section is its own celestial element: stations (experience),
a nebula (research), planets (projects), spiral arms (skills), an asteroid belt (certs), comets (notes) and a
beacon (contact). The terminal triggers light-speed warps, and free-flight is opt-in. The real content is
always server-rendered HTML underneath, so recruiters can read everything by just scrolling.
Full 3D spec, including the immersion layers (intro, living world, parallax, cinematic post-fx,
holographic panels, seamless transitions): `docs/GALAXY.md`. No sound effects.

Audiences, in priority order:
1. Recruiters and hiring managers, who skim.
2. Engineers and researchers, who dig into case studies.
3. Search engines and AI agents, which read HTML, JSON-LD, `/llms.txt` and `/agents`.

Explicitly **out** (cut from v2 for reliability): Rapier (replaced by a custom lightweight physics module,
`docs/PHYSICS.md`), the black-hole *loader* cutscene, and the
Compile mechanic. Free-flight is back, but kinematic and opt-in (GALAXY §5). An "explored X / Y" counter
replaces Compile.

## 2. Information architecture
```
/                    Profile (server-rendered), in galaxy order: Hero (black hole) → Now → Experience (stations)
                     → Research (nebula) → Projects (planets) → Skills (spiral arms) → Certifications (asteroids)
                     → Notes (comets) → Education → FAQ → Contact (beacon)
/work/[slug]         Case study per project/paper (SSG + ISR)
/galaxy             Full-screen galaxy + free-flight (deep links: /galaxy?to=<slug>, /galaxy?fly=1)
/llms.txt            Markdown profile          /llms-full.txt   Full Markdown incl. case studies
/agents              JSON profile (JSON-Resume-like)
/resume.pdf          Static file (hidden link until present)
/api/edit/*          Edit-mode API (see SECURITY.md)
/notes, /notes/[slug] Lab notes (EXTRAS §4)   /resume  Print résumé (EXTRAS §2)
/security            Security of this site (EXTRAS §15)   /.well-known/security.txt (EXTRAS §13)
```

## 3. Design system
Space theme, used with restraint. The starfield sets the mood, and typography and spacing carry the
content. Avoid generic AI-site tells: no all-caps eyebrow labels, no identical card grids with the same
shadow, no single-word accent in headlines, and no 01/02/03 markers on things that aren't sequences.

### 3.1 Color tokens (CSS variables on `:root`, dark-first)
| Token | Value | Use |
|---|---|---|
| `--space-0` | `#05070F` | Page background (under starfield) |
| `--space-1` | `#0B1020` | Raised surfaces |
| `--space-2` | `#131A30` | Hover / borders |
| `--starlight` | `#E7ECF5` | Body text (verify AA on all surfaces) |
| `--dust` | `#9AA4BD` | Secondary text (verify ≥ 4.5:1) |
| `--signal-done` | `#6FE3E9` | "Shipped / published" stars and badges |
| `--signal-wip` | `#F2B84B` | "In progress / under review" stars and badges |
| `--nebula` | `#8B6CFF` | Rare accent: focus ring, skill lines, nebula tint |
| `--love-rose` | `#FF5C8A` | Teju mode only |
| `--love-blush` | `#FFD3DF` | Teju mode only |
A light theme is **not** in scope. Use `color-scheme: dark`.

### 3.2 Type
- **IBM Plex Sans** for body and headings, with **IBM Plex Mono** for data, status, the terminal hero and
  ⌘K. One family with an engineering voice. Load via `next/font/google`, `display: swap`.
- Scale (rem): 0.8125 / 0.9375 / 1.0625 (body) / 1.375 / 1.875 / 2.75 / 4 (hero, clamp() responsive).
- Line length ≤ 72ch. Body line-height 1.6. Headings 1.15.

### 3.3 Motion
- **One** orchestrated load moment: the hero terminal types the pitch line (about 1.2 s) while the starfield
  fades in. Nothing else animates on load.
- Response motion only: panel opens, ⌘K open/close, star hover glow.
- `prefers-reduced-motion: reduce` → no typing (text appears instantly), starfield static, no camera tweens.
- Library (owner decision 2026-10-13): **GSAP** (`gsap` + `@gsap/react` `useGSAP`, ScrollTrigger) for all DOM and
  scroll animation, replacing `motion`; R3F `useFrame` with damped deltas for 3D. All GSAP setup goes through
  `gsap.matchMedia()` so reduced motion is honored.
- Smooth scroll: **Lenis**, desktop pointer devices only. Off under reduced motion, paused (`lenis.stop()`) while
  ⌘K, dialogs, the tour or free-flight are open, native on touch. Driven by `gsap.ticker` (one RAF, shared with
  ScrollTrigger; R3F stays on its own frameloop).
- **React Bits** (copy-paste components): curated only. Allowed when its dependencies are already in the stack
  (GSAP, three), restyled to §3.1 tokens, reduced-motion aware, no extra WebGL context (no `ogl`). Name each one
  used in the phase report.

### 3.4 Status honesty
Every project/paper shows exactly one status badge:
`Published` · `Under review` · `In preparation` · `Shipped` · `In progress` · `Proposal`.
Metrics appear only when the item has `metricsPublic: true` **and** a `metrics[]` array (FedDecept and AXON are
approved; nothing else is yet).

## 4. Content model
### 4.1 Source
`src/data/content.ts` (from `seed/content.seed.ts`) is typed with the interfaces in that file and validated at
build time with `zod`. Invalid seed means the build fails.

### 4.2 Merge order (request time, cached)
`seed` ← `GitHub repos (Phase 10)` ← `KV overrides (edit mode)`.
- KV holds `{ upserts: Item[], tombstones: slug[] }`. A tombstone hides a seed item without deleting the seed.
- Merged result is cached with `unstable_cache` / tag `content` and revalidated on every successful edit
  (`revalidateTag('content')`). **Verify this API exists in the installed Next version before using it.**

### 4.3 Placeholder rule (safety net — the intake gate means this should never trigger in prod)
Any item whose required field contains `TODO(owner)` is **filtered out of public output** (HTML, JSON-LD,
llms, /agents, the galaxy). In `NODE_ENV=development` it renders with a red "needs owner" badge so the
gaps stay visible.

### 4.4 GitHub sync (auto, no API key)
- **Sources:** `GET /users/sriman676/repos?per_page=100` and, per repo, its README (`/repos/{o}/{r}/readme`,
  raw media type). Use the unauthenticated public REST API (60 req/h/IP). Results are cached with ISR
  `revalidate: 3600` so traffic never multiplies requests. An optional `GITHUB_TOKEN` (server-only,
  read-only public scope) raises the limit, but it's **not required**. Verify endpoints in the GitHub REST docs.
- **Mapping:** name → title, `description` → public blurb (the owner's own words on GitHub), `topics` +
  `language` → skills, `html_url` → link, `stargazers_count`, `pushed_at`, `archived`.
  Status: `archived` → shipped. Otherwise it's **not inferred**: the owner sets it at intake or in edit mode.
  Until then it shows the neutral badge "On GitHub".
- **New repos auto-appear** (owner choice) in the "More on GitHub" group, using only GitHub-provided fields.
  They join the galaxy as small distant planets.
- **README drafts:** Claude Code (intake) and edit mode (a "Draft from README" button) can create a richer
  blurb or case-study body from the README. It's stored with `draft: true` and never public until the owner
  approves. Drafts must only restate what the README says: no new claims or metrics.
- **Precedence:** KV override > seed > GitHub. A seed item with `repo:` gets live stars and last-updated
  data from GitHub but keeps its own text.
- **Hidden:** `hiddenRepos` + per-item `hide`. Forks are hidden by default.
- **Link health:** CI job `check:links` HEADs every repo/verify URL and fails on 404.
- **Failure:** on rate limit or error, serve the last good cached result, else seed-only. Never a broken page.

### 4.5 Ordering (owner-controlled)
- Presets: `featured-first` (default), `recently-updated` (GitHub `pushed_at`), `most-stars`, `manual`.
- `pinnedFirst` / `pinnedLast` always win over the preset. Unpinned items follow the preset.
- Order applies to the Projects and Research sections, ⌘K's default list, planet orbit order and the
  galaxy's keyboard Tab order. Seed default is in `content.ordering`, and edit-mode changes are stored in KV.

## 5. 3D layer
**Governed by `docs/GALAXY.md`** (layout, scroll journey, warp system, terminal integration, free-flight,
mobile, fallbacks, budget). Render settings for the single site-wide Canvas: DPR clamp `[1, 1.75]`,
`antialias:false` (use the postprocessing AA on the high tier), `powerPreference:'high-performance'`,
`frameloop` "demand" whenever the camera is idle.

### 5.3 Effects tier (GALAXY §6 has the full per-tier feature table)
`high` (desktop GPU, ≥ 8 GB RAM hint, no reduced motion) → bloom + 4k stars.
`medium` → no bloom, 2k stars. `low` (mobile weak / `saveData` / reduced motion) → static CSS star image +
2D galaxy map. Detection: `navigator.hardwareConcurrency`, `deviceMemory` (where supported),
`connection.saveData`, a WebGL capability probe, and a 2-second FPS sample with downgrade on sustained
< 40 FPS.

## 6. ⌘K terminal (command palette)
**Governed by `docs/TERMINAL.md`.** In short: a hybrid terminal (terminal look + clickable results), opened by
⌘K / Ctrl+K / `/` / the search bar. It has commands, autocomplete, history, typo suggestions and fun
commands (`neofetch`, `sudo hire-sriman`, `matrix`). The edit-mode trigger and Teju word are typed here, are
hash-matched, and are never stored or echoed. UX additions (chips, status line, deep links, tour, scroll-spy,
shortcuts, résumé preview) are specified there too.

## 7. Edit mode (summary; SECURITY.md governs)
- Trigger word in ⌘K → passphrase dialog → `POST /api/edit/login` → httpOnly session cookie (30 min).
- **Scope (owner decision, INTAKE round 2):** every content section is editable, not only papers/projects: person
  (bio, photo), TL;DR, Now, experience, education (incl. CGPA), certs (add title + issuer + link), skills, FAQ,
  availability, terminal texts, Teju-mode texts, notes, retros and ordering. Each section gets its own zod schema
  and the same SECURITY.md controls; list sections (experience, certs, FAQ…) use the same upsert/tombstone model.
- The editor is a drawer listing all items (seed + KV), with actions Add / Edit / Hide (tombstone) /
  Restore / Delete KV item. The form mirrors the zod schema, has a live preview card, and Save →
  `PUT /api/edit/items/:slug`.
- **Arrange tab:** drag-and-drop list of all items, "Pin first" / "Pin last" / "Unpin" buttons, preset
  selector, show/hide toggle per item, and a "Draft from README" button for repo items. Keyboard-accessible
  reordering is required: Move up / Move down buttons, with an `aria-live` announcement of the new position.
  Saved as KV `ordering` via `PUT /api/edit/ordering`.
- **GitHub inbox:** repos that appeared since the last visit are listed with Show / Hide / Set status.
- On success the change appears without a redeploy (revalidated cache).
- Logout button. The session expires automatically.

## 8. Teju mode (summary; TEJU_MODE.md governs)
Typing "teju" in ⌘K starts a full-screen sequence: stars gather into a heart, "I love you" appears, a
typewriter love letter plays, then "Will you be mine?" with Yes / No. It stays until Yes or close, with soft
synth music and a visible mute button.

## 9. SEO / AEO
- `metadata` per route: title, description, canonical, OpenGraph, Twitter. Dynamic OG image via
  `next/og` `ImageResponse` (verify import path in installed Next).
- JSON-LD: `Person` + `ProfilePage` on `/`. Each paper is a `ScholarlyArticle` with `creativeWorkStatus`
  matching its status, projects are `SoftwareSourceCode`, certs are `EducationalOccupationalCredential`,
  and the FAQ is `FAQPage`.
- `/llms.txt`, `/llms-full.txt`, `/agents` are generated from merged content and are never hand-written.
- `robots.ts` allows search and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), and
  `sitemap.ts` includes all `/work/*` pages.

## 10. Contact & conversion
- Header and footer: Email (mailto + "copy" button with toast), LinkedIn, GitHub, ORCID, Résumé
  (hidden until `/public/resume.pdf` exists).
- No contact form in v3 (no extra write path).
- Analytics: `@vercel/analytics` page views plus custom events `resume_download`, `email_copy`,
  `case_study_open`, `galaxy_fly`, `warp` (target only), and `perf_tier` (GALAXY §13).
Speed Insights for real-user Core Web Vitals. No cookies, no PII. Secret phrases are never logged.

## 11. Security headers (Phase 12)
CSP with nonces (script-src self + nonce, no `unsafe-inline` scripts; `wasm-unsafe-eval` only if a
dependency needs it, so justify it), `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` minimal set.

## 12. Stack (verify exact versions at install; majors are guidance)
Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · three · @react-three/fiber 9 ·
@react-three/drei 10 · @react-three/postprocessing (high tier only) · gsap + @gsap/react · lenis · zustand · zod ·
@upstash/redis · @upstash/ratelimit (**verify it exists and its API**) · @vercel/analytics ·
vitest + @testing-library/react (unit) · Playwright (smoke/e2e).
No Rapier, no `motion` (replaced by GSAP, §3.3).

## 13. File tree (target)
```
app/
  layout.tsx  page.tsx  not-found.tsx  error.tsx  globals.css  opengraph-image.tsx
  work/[slug]/page.tsx   galaxy/page.tsx
  llms.txt/route.ts  llms-full.txt/route.ts  agents/route.ts  robots.ts  sitemap.ts
  api/edit/{login,logout,session,items/[slug],items}/route.ts
src/
  data/content.ts  data/schema.ts
  lib/{content.ts,merge.ts,github.ts,kv.ts,auth.ts,ratelimit.ts,hash.ts,jsonld.ts,llms.ts,tier.ts,audio.ts}
  components/profile/*   components/terminal/{Terminal.tsx,Scrollback.tsx,Suggestions.tsx,Chips.tsx,Matrix.tsx,Neofetch.tsx}
  components/ux/{StatusLine.tsx,ScrollSpy.tsx,ShortcutSheet.tsx,Tour.tsx,ResumePreview.tsx}
  lib/terminal/{commands.ts,parse.ts,complete.ts,history.ts,fuzzy.ts}
  components/galaxy/{GalaxyCanvas.tsx,Starfield.tsx,BlackHole.tsx,Stations.tsx,Nebula.tsx,Planets.tsx,SpiralArms.tsx,
    AsteroidBelt.tsx,Comets.tsx,Beacon.tsx,Journey.tsx,Warp.tsx,FreeFlight.tsx,Minimap.tsx,GalaxyMap2D.tsx,shaders/*}
  store/warp.ts
  lib/physics/{world.ts,bodies.ts,integrate.ts,gravity.ts,springs.ts,collide.ts,orbit.ts,guard.ts,params.ts,input.ts}
  components/edit/{PassphraseDialog.tsx,EditorDrawer.tsx,ItemForm.tsx}
  components/heart/{HeartMode.tsx,HeartField.tsx,LoveLetter.tsx,Proposal.tsx,loveSynth.ts,constants.ts}
  store/ui.ts
scripts/{make-secrets.mjs,layout-galaxy.mjs}
tests/{unit,e2e}
```
