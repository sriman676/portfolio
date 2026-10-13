# Build Phases — send one at a time: "Run Phase N from docs/PHASES.md"

**Order:** 0 → 0.5 (intake) → 0.75 (design preview) → 1 → 2 → **2.5 (first live deploy)** → 3 → 4 → 4.5 → 4.75 → 4.8 → 4.9 → 5 … 13.
Both 0.5 and 0.75 block everything after them. From 2.5 on, every phase ships via PR → Vercel Preview → merge.

**Priority labels** (use these if time runs short):
- **MUST**: the site isn't credible or safe without it. Never skip.
- **SHOULD**: big quality gain. Skip only under real time pressure, and nothing MUST depends on it.
- **COULD**: delight. Safe to defer indefinitely.
Inside phases, the fun terminal commands (`neofetch`, `sudo`, `matrix`) and the guided tour are COULD-level
items: build them last within their phase. Phases 8–9 (admin) can be skipped entirely; content then changes
via commits, and Phase 13 shrinks to deploy-only. If a SHOULD phase is skipped, Phase 12 still runs in full.

Every phase starts on its own branch (CLAUDE.md → Git workflow) and ends with these steps:
1. `npm run build && npm run lint && npx tsc --noEmit` (and `npm test` once tests exist) all green.
2. A report with ✅/❌ against each acceptance item, the First Load JS for `/` from the build output, the files
   changed, the APIs you verified (and where), and open questions.
3. Update the status in `CLAUDE.md`.
4. STOP and wait for the owner.

---

## [MUST] Phase 0 — Preflight (no app code)
**Read:** all docs (first and only full read).
**Prompt:** Inspect the environment. Verify the latest stable versions and peer deps for every package in
SPEC §12 using `npm view`. Confirm R3F 9 ↔ React 19 and drei 10 ↔ R3F 9 compatibility from their
package.json peers. Confirm `@upstash/ratelimit` exists and read its README. Confirm whether `unstable_cache`
and `revalidateTag` exist in the Next 15 version you'll install. For password hashing (SECURITY.md §3.1):
confirm the current OWASP Argon2id minimums, whether Node's built-in `crypto.argon2` exists in Vercel's Node
runtime, and whether `@node-rs/argon2` works in a Vercel function. Pick one and report why. List the skills and plugins you found.
Propose the exact `package.json` dependency block. Install nothing yet.
**Accept:** a version table with sources, peer-dep matrix, API confirmations (or "not found, alternative: …"),
the skills list, and any spec conflicts found.

## [MUST] Phase 0.5 — Intake gate (blocks everything after it)
**Read:** INTAKE.md, WRITING_GUIDE.md, seed/content.seed.ts, SPEC §4.
**Prompt:** Do not scaffold the app yet. Create a minimal `package.json` (scripts only) and
`scripts/check-intake.mjs` per `docs/INTAKE.md`. Fetch the GitHub repo list and READMEs for `sriman676`
(unauthenticated; if rate-limited, say so and retry later, never guess repo data). Then generate
`docs/INTAKE.md` with every open item per its 12 sections: all `TODO(owner)` and `VERIFY` lines, every Phase 0
question, and a decision block for every synced repo, with README-based `PROPOSED:` blurbs that only restate
the README. Then STOP and ask the owner to fill it in.
When the owner says "intake done": apply the answers to `src/data/content.ts` exactly as written, run
`node scripts/check-intake.mjs`, and report. If anything is unclear in an answer, ask. Don't interpret.
**Accept:** `check-intake` exits 0. Zero `TODO(owner)` / `VERIFY` remain outside `hide: true` items. Every
synced repo has a decision. You list each change you applied, with the matching Q-id.

## [MUST] Phase 0.75 — Design preview (blocks Phase 1)
**Read:** EXTRAS §1, SPEC §3, DESIGN skills.
**Prompt:** Follow `docs/EXTRAS.md` §1. Build `design/a-dossier.html` and `design/b-console.html` plus
`design/compare.html` (both side by side + 390 px mobile frames). Use real content, static only. Then STOP
and ask the owner to choose. Record the decision in `docs/DESIGN_DECISION.md`.
**Accept:** both mockups open from disk with no server. AA contrast holds. The owner's decision is recorded.

## [MUST] Phase 1 — Scaffold, content layer, profile page (no 3D)
**Read:** SPEC §2–4, EXTRAS §5 §9 §11, DESIGN_DECISION.md.
**Prompt:** Scaffold Next 15 App Router + TS strict + Tailwind 4 + ESLint. Add design tokens (SPEC §3.1) and
fonts (§3.2). Create `src/data/schema.ts` (zod) and `src/data/content.ts` from `seed/content.seed.ts`.
Implement the placeholder rule (§4.3). Build `/` fully server-rendered, matching `docs/DESIGN_DECISION.md`: Hero (terminal-typed pitch,
instant under reduced motion), Recruiter TL;DR (EXTRAS §5), platform badges (§11), Now (with "Updated" date, §9), Experience, Research, Projects, Skills, Certifications, Education, FAQ and Contact,
with the status badges from §3.4. Add a skip link, landmarks, and visible focus. Create
`.github/workflows/ci.yml` (`npm ci`, tsc, lint, build, `npm audit --omit=dev --audit-level=high`,
`permissions: contents: read`). Add vitest with one schema test. Wire `check-intake --prod` as `prebuild`.
**Accept:** view-source shows all content. No TODO item is visible in `next build && next start`, and TODOs
are visible with a red badge in dev. Contrast passes AA (report the ratios for `--starlight` and `--dust` on
`--space-0`/`--space-1`). Keyboard-complete. First Load JS for `/` reported.

## [MUST] Phase 2 — SEO / AEO
**Read:** SPEC §9.
**Prompt:** Implement SPEC §9: metadata, canonical, OG/Twitter, the dynamic OG image, all JSON-LD types,
`robots.ts`, `sitemap.ts`, `/llms.txt`, `/llms-full.txt` and `/agents`, all generated from merged content
(the merge is seed-only for now, but keep the merge function's signature ready for GitHub and KV).
**Accept:** JSON-LD validates (paste the output of a schema validation; if you can't run one, say so). Paper
`creativeWorkStatus` matches its status. llms/agents contain no TODO items. robots allows the listed AI
crawlers.

## [MUST] Phase 2.5 — First live deploy (recruiter page only)
**Read:** PHASES Phase 13 steps 1, 3, 5, 7 only.
**Prompt:** Deploy the Phase 2 site to Vercel as `https://<project>.vercel.app`. Set only
`NEXT_PUBLIC_SITE_URL`. **Don't** set any admin secrets yet, so admin mode is fully off (fail closed) and no
Upstash is needed. Enable Vercel Analytics, add basic security headers early (full CSP comes in Phase 12),
and run Lighthouse on production. Tag `v3-live-1`.
**Accept:** the production URL serves the full recruiter page. Lighthouse mobile ≥ 90 on all four categories.
The owner can share this link from now on, and every later phase improves it in place.

## [MUST] Phase 3 — Galaxy core: canvas, starfield, black-hole hero
**Read:** GALAXY §0 §1 (black hole + background only) §6 §8 §12 (governor part), SPEC §5, CLAUDE.md rule 8.
**Prompt:** Build the single site-wide `GalaxyCanvas` (lazy, `ssr:false`, mounted once in the layout), the 3-layer
starfield (instanced, with a velocity uniform ready for warp streaks), and the **black-hole hero** (accretion
disk, photon ring, horizon; lensing on the high tier only). Add tiers + the **runtime quality governor** (GALAXY §12) + the dev `?perf=debug` overlay, the error boundary,
context-loss handling, and the low-tier hero still. The desktop first screen is the black hole with the HTML
hero on top.
**Accept:** the first black-hole frame time is measured and reported. ≥ 60 FPS on desktop high. HTML First
Load JS is unchanged (±5 kB). The 3D chunk size is reported. A forced throw and a context loss both fall back
cleanly. Reduced motion = still image.

## [MUST] Phase 4 — Galaxy regions + 2D map
**Read:** GALAXY §1 §7 §12, SPEC §4.
**Prompt:** Write `scripts/layout-galaxy.mjs` (deterministic → `src/data/galaxy.json`, run in `prebuild`) and
every region from GALAXY §1: stations, research nebula, planetary system (incl. GitHub-only planets), spiral
arms + skill lines, asteroid belt, comets (hidden when empty), beacon, and new-repo ignition. Build
`GalaxyMap2D` (SVG, accessible buttons) as the fallback and the future minimap. Add hover labels and keyboard
focus order following `ordering`. Implement LOD, culling and active-region updates per GALAXY §12.
**Accept:** unit test (same content → same `galaxy.json`). Adding a paper/project/cert in content adds its
body with no code change. The 2D map matches 3D. All regions pass the FPS bar. Draw calls and triangles per region reported, LOD has no visible popping.

## [SHOULD] Phase 4.5 — Scroll journey + warp system
**Read:** GALAXY §2 §3 §6.
**Prompt:** Build the camera spline + scroll mapping with dwell zones and HTML panel fades (native scroll, no
scroll-jacking), and `store/warp.ts` with `warpTo(target, {variant})`: spool → star-streak jump → drop-out →
per-region entry effects, the 1.5 s / 0.8 s timing, skip, retargeting, and the gentle/instant variants. Wire
the side nav, scroll-spy and `/galaxy?to=`.
**Accept:** GALAXY §9 items for journey and warp (terminal wiring comes in Phase 6). Reduced motion = no camera
flight. Mobile = 0.8 s warps. The warp FPS is reported.

## [SHOULD] Phase 4.75 — Free-flight mode (desktop)
**Read:** GALAXY §5 §6.
**Prompt:** Implement GALAXY §5: the Launch button, `/galaxy?fly=1`, kinematic controls with inertia, visual-only
black-hole pull, proximity labels + Enter, the HUD with minimap (reuse `GalaxyMap2D`), the explored counter,
the first-run controls card and Esc exit. Disabled on phones and on the low tier.
**Accept:** Esc always exits. Keyboard-only flight works. No physics dependency in `package.json` (kinematic for now; real
physics arrives in Phase 4.8). 60 FPS on
desktop high.

## [SHOULD] Phase 4.8 — Physics engine + interactions
**Read:** PHYSICS.md, GALAXY §5 §6.
**Prompt:** Build the custom engine in `src/lib/physics/` exactly per PHYSICS §1–§2 (fixed timestep, SoA,
symplectic Euler, softened gravity, springs, soft sphere collisions, orbit capture, guards, dev tuning panel).
Write all PHYSICS §5 tests **first**, then the implementation. Then wire the 7 interactions from PHYSICS §3,
with shader uniforms for 1, 4, 6, 7 and CPU bodies for 2, 3, 5. Upgrade free-flight motion to real physics.
`package.json` must not gain any physics dependency.
**Accept:** all PHYSICS §5 tests pass. Physics CPU ms/frame measured on desktop and a mid phone. FPS bars still
met. Reduced motion = all interactions off. Scrolling, taps and panel clicks are never hijacked (Playwright:
scroll the journey and click every panel button with interactions on). The owner signs off on PHYSICS §4 feel.

## [SHOULD] Phase 4.9 — Immersion pass
**Read:** GALAXY §10 §11 §6.
**Prompt:** Implement all GALAXY §10 layers: the first-visit cinematic intro (skippable), shader warm-up, living
world, cursor/gyro parallax, high-tier cinematic post-processing, holographic DOM panels anchored to bodies,
seamless route transitions as warps (canvas never remounts), fullscreen in free-flight, and Android haptics.
**No sound effects.** Report per-tier what's on and off, first-warp frame-time vs median, and FPS for each
region on high and medium.
**Accept:** GALAXY §9 + §10 acceptance. Text over 3D passes AA in every region (paste the contrast checks).
Hand the §11 checklist to the owner, and the owner reports the results.

## [MUST] Phase 5 — Case studies + lab notes
**Read:** SPEC §4, EXTRAS §4 §8, SECURITY §3.4.
**Prompt:** `/work/[slug]` with `generateStaticParams` + ISR, using the template in EXTRAS §8 (incl. "What I'd
do differently"). Also build lab notes per EXTRAS §4 (`/notes`, `/notes/[slug]`, `content/notes/*.md`). Add a minimal safe
Markdown renderer for `body` (SECURITY.md §3.4). Add per-page metadata and JSON-LD.
**Accept:** every non-TODO item has a page. Metrics appear only for FedDecept and AXON (owner-approved). Missing body → the page shows
the blurb plus "Write-up coming", with no lorem. Raw HTML in body is rendered as text (unit test).

## [MUST] Phase 6 — ⌘K terminal
**Read:** TERMINAL.md, SPEC §6, GALAXY §4.
**Prompt:** Implement `docs/TERMINAL.md` §1–§4 fully (all commands incl. fun ones), wired to the warp system
per GALAXY §4 (terminal genie-minimizes into the ⌘K button during warps and stays minimized with `docked at:` on arrival), plus UX feature A (chips +
quick actions) and C (deep links `/?cmd=` with the whitelist, plus share). Secret-phrase hook emits
`'edit' | 'heart' | null`. For now `'edit'` opens a placeholder "Edit mode coming in Phase 8", and `'heart'`
does nothing until Phase 7. Unit-test the parser, completion, typo distance, history-secret exclusion and the
URL whitelist.
**Accept:** TERMINAL.md §6 items, except the résumé preview (Phase 11). Report the `/` First Load JS delta.

## [SHOULD] Phase 7 — Teju mode (owner priority)
**Read:** TEJU_MODE.md, TERMINAL §3.
**Prompt:** Implement `docs/TEJU_MODE.md` exactly, under the neutral code name `heart`. Lazy chunk. If
`content.heart` fields are TODO, the trigger is a no-op in production and shows a dev notice in development.
**Accept:** every item in TEJU_MODE §7. Test the full sequence with keyboard only and with reduced motion,
and report both.

## [SHOULD] Phase 8 — Edit mode backend (security-critical)
**Read:** SECURITY.md, EXTRAS §3, SPEC §4.2.
**Prompt:** Implement everything in `docs/SECURITY.md` §3 (incl. §3.8 TOTP and §3.9 versioning): `lib/kv.ts` (Upstash + dev-only shim that throws
in prod), `lib/auth.ts` (Argon2id, TOTP, HMAC cookie), `lib/ratelimit.ts`, all routes in §3.5, the audit log, and
the merge of KV upserts and tombstones into content with cache revalidation. Write all tests in §4. Then run
the security review skill and paste its findings. Fix every High and Medium.
**Accept:** all SECURITY.md §4 tests pass. The secret-grep CI step exists and passes. Security review is
PASS (paste it). No UI yet.

## [SHOULD] Phase 9 — Edit mode UI
**Read:** SPEC §7, SECURITY §3.5 §3.8, EXTRAS §3 §9.
**Prompt:** Replace the Phase 6 placeholder with `PassphraseDialog`, then `EditorDrawer` + `ItemForm` per
SPEC §7: list (seed / KV / hidden filters), add, edit, hide, restore and delete, live preview, field-level
errors from zod, a session countdown and logout. Login dialog has passphrase + 6-digit code fields.
Add Undo toast, History tab, Export button, and the stale-content banner (EXTRAS §3, §9). Add optimistic UI with rollback on error. Run the security
review again on the client (no secrets, no HTML injection).
**Accept:** the full CRUD loop works against the dev shim and a real Upstash instance (if owner provided
one). An edit shows publicly after save without a redeploy. A wrong passphrase gives a generic error. Expiry
logs out gracefully. (Arrange tab + GitHub inbox come in Phase 10.) Fully keyboard-operable.

## [SHOULD] Phase 10 — GitHub auto-sync + ordering
**Read:** SPEC §4.4 §4.5 §7, SECURITY §3.5.
**Prompt:** Implement SPEC §4.4 and §4.5 exactly: `lib/github.ts` (repos + README, ISR 3600, optional
server-only `GITHUB_TOKEN`), mapping, precedence, auto-appearing "More on GitHub" group, forks hidden,
last-good cache, `check:links` CI job, and the ordering resolver (`lib/order.ts`, unit-tested: pins beat
presets, missing slugs ignored). In edit mode add the Arrange tab, GitHub inbox, and "Draft from README"
(SPEC §7; routes in SECURITY.md §3.5). Run the security review on the new routes.
**Accept:** a new public repo appears within ≤ 1 h with no redeploy (simulate it by mocking the API). The build
works offline. The rate-limit path serves the cache. Drafts are never public (test). Reorder works by
drag **and** keyboard. Pinned order is reflected in Projects, ⌘K, planet orbits and galaxy Tab order. Security review
is PASS.

## [SHOULD] Phase 11 — Contact, résumé, polish
**Read:** SPEC §10, TERMINAL §5, EXTRAS §2 §10 §16–§19.
**Prompt:** SPEC §10 (copy-email toast, résumé button hidden until the file exists, analytics events), plus
TERMINAL.md §5 features B (status line), D (guided tour), E (scroll-spy + `?` shortcut sheet) and F (résumé preview).
Also EXTRAS §2 (`/resume` + generated PDF with the one-page check) and §10 (print stylesheet). Run
the `impeccable` / `design-audit` skills over all pages and fix the findings. Add `not-found` and `error` pages
in theme. Also EXTRAS §16, §17, §19 (UTM tracking, résumé QR, real-device test). §18 is dropped.
Add a Playwright smoke test: load `/`, open ⌘K, run `help`, `neofetch`, `open feddecept`, run `tour` to the end,
`experience` warps and docks, `fly` works on desktop, and confirm a secret word leaves no trace in history.
**Accept:** Lighthouse mobile Perf, A11y, Best Practices and SEO ≥ 90 (paste the scores). The owner completes the
real-device checklist (EXTRAS §19) and reports the results. Smoke tests pass.

## [MUST] Phase 12 — Hardening & CI
**Read:** SPEC §11, SECURITY.md, EXTRAS §6 §7 §13–§15, GALAXY §13.
**Prompt:** Security headers + nonce CSP per SPEC §11 (verify the Next 15 middleware nonce pattern in the
docs). CI: `npm ci`, tsc, lint, unit, `npm audit` (EXTRAS §14), check-intake, check-links, build, 3D budget check,
secret-grep, trigger-grep (TEJU_MODE §7), the Playwright matrix + axe + visual snapshots (EXTRAS §6). Add
Dependabot + SHA-pinned actions (§14), `security.txt` (§13), the `/security` page (§15), and real-user
monitoring per GALAXY §13 (Speed Insights + optional `perf_tier` event, no custom endpoint). Then a final
security review.
**Accept:** headers verified with `curl -I`. `security.txt` is valid with a future Expires. `npm audit` is clean at
high. The `/security` page renders the live CSP and mentions no secrets, trigger or Teju mode. The CSP produces no console violations across all features
(3D, ⌘K, Teju, edit). CI is green. Security review is PASS.

## [MUST] Phase 13 — Owner secrets & deploy (owner present)
**Read:** SECURITY §3.1 §3.8, BREAK_GLASS.md, this phase.
**Prompt:** Write `scripts/make-secrets.mjs` with the flags listed in `docs/BREAK_GLASS.md`: it prompts (hidden input) for the edit trigger word and the
passphrase, prints `NEXT_PUBLIC_EDIT_TRIGGER_HASH`, `EDITOR_PASSPHRASE_HASH`, a random `SESSION_SECRET`, the TOTP secret +
otpauth URI, and recovery-code hashes (codes printed once). It writes nothing to disk. Then walk the owner through the **Vercel** deploy step by step (verify each step in the current Vercel docs):
1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js).
2. Add Upstash Redis from the Vercel Marketplace / Storage tab and connect it to the project. Confirm which env
   var names it injects (`KV_REST_API_*` or `UPSTASH_REDIS_REST_*`); `lib/kv.ts` reads both.
3. Add env vars for Production (and Preview if wanted): `NEXT_PUBLIC_EDIT_TRIGGER_HASH`,
   `EDITOR_PASSPHRASE_HASH`, `SESSION_SECRET`, `EDITOR_TOTP_SECRET`, `EDITOR_RECOVERY_HASHES`,
   `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`, optional `GITHUB_TOKEN`. Mark server secrets as
   Sensitive. Redeploy after changing `NEXT_PUBLIC_*` values (they're baked in at build).
4. Preview deployments: either give them a separate Upstash database or leave admin env vars unset there,
   so admin mode is disabled on previews (fail closed).
5. Enable Vercel Analytics for the project.
6. Post-deploy check in prod: every terminal command, Teju mode, admin login (password + TOTP), an edit
   showing live, Export, security headers (`curl -I`), `security.txt`, `/llms.txt`.
7. Final Lighthouse run on the production URL.
**Accept:** production URL live on `*.vercel.app`. The owner has an offline copy of BREAK_GLASS.md + recovery codes. Admin mode is disabled on Preview deployments unless set up
separately. Edit login (passphrase + TOTP) works in prod. Teju mode works in prod. Teju mode works in prod. Lighthouse ≥ 90 in prod.
