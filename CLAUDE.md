# CLAUDE.md — Cosmos v3 (standing rules)

The spec lives in `docs/SPEC.md`, with `docs/GALAXY.md`, `docs/PHYSICS.md`, `docs/SECURITY.md`, `docs/TEJU_MODE.md`, `docs/TERMINAL.md` and `docs/EXTRAS.md` alongside it.
If this file conflicts with them, the spec wins, and you must flag the conflict out loud.

## What this is
A recruiter-first portfolio with a 3D space theme. Server-rendered HTML is the real site. On top of it sit a
3D galaxy (black-hole hero, one celestial region per section, scroll journey, light-speed warps,
opt-in free-flight; docs/GALAXY.md), a ⌘K terminal, a secret
edit mode guarded by a server-checked passphrase, and a private "Teju mode" easter egg.

## Golden rules
1. **Content is HTML first.** Every fact is in server-rendered HTML (view-source shows it). 3D is enhancement;
   the site is complete with JS off or WebGL unsupported.
2. **One source of truth:** `src/data/content.ts` (seed), merged with KV overrides at request time.
   No content hard-coded in components.
3. **No fabrication.** Never invent titles, metrics, quotes, links, issuers or dates. Items with
   `TODO(owner)` in a required field are not rendered publicly (dev shows them with a red badge).
4. **Admin mode is the ONLY write path.** It must satisfy every control in `docs/SECURITY.md`. No beacons, counters,
   forms or guestbooks. The trigger word
   is obscurity, not authentication. The passphrase is checked server-side only.
5. **Secrets:** no secret ever goes in the client bundle or the repo. Only `NEXT_PUBLIC_EDIT_TRIGGER_HASH` and
   `NEXT_PUBLIC_SITE_URL` are public. Never commit `.env*`.
6. **3D is lazy.** Three.js/R3F load only via `next/dynamic({ ssr:false })` after first paint and only when
   the effects tier allows it. They are never part of the HTML-path First Load JS.
7. **No sound effects** anywhere (Teju music is the only audio). **No stock 3D models, no third-party physics engine.** All geometry is procedural, shaders are inline GLSL
   strings, and physics uses only the custom lightweight module in `src/lib/physics/` (docs/PHYSICS.md).
8. **Lessons from v2** (the old repo crashed with `Cannot read properties of null (reading 'alpha')` inside the
   Canvas): never mount postprocessing until the GL context exists, wrap the Canvas in an error boundary that
   falls back to the 2D galaxy map, and handle `webglcontextlost` / `webglcontextrestored`.

## Access matrix (do not mix these up)
| Feature | How it's reached | Auth |
|---|---|---|
| Public site, ⌘K terminal, fun commands | anyone | none |
| **Teju mode** | type `Teju` (any case) in ⌘K, matched by **SHA-256 hash** (`HEART_HASH`), never the plain word | no password, no 2FA, no server call |
| **Admin / edit mode** | type the edit keyword in ⌘K, matched by **SHA-256 hash** (`NEXT_PUBLIC_EDIT_TRIGGER_HASH`) | **password (Argon2id) + 6-digit TOTP**, checked server-side |
The password and TOTP exist only for admin mode. Never add auth to Teju mode, and never let the Teju word or
any other path open admin mode.

## Intake gate
No app code before Phase 0.5 passes (`node scripts/check-intake.mjs` exits 0). Every unknown becomes a
question in `docs/INTAKE.md`. You never answer it yourself.

## Git workflow
- One branch per phase: `phase/<n>-<short-name>` (e.g. `phase/4-galaxy-regions`).
- Small, focused commits with conventional messages (`feat:`, `fix:`, `test:`, `docs:`). Never mention the Teju word
  in commit messages or branch names.
- At phase end: open a PR to `main` with the phase report as the PR description. Vercel builds a Preview.
  The owner checks the Preview, then merges. After merge, tag `v3-phase-<n>`.
- If a phase breaks something: `git revert` the merge or redeploy the previous tag in Vercel. Never force-push
  `main`.
- Never commit `.env*`, secrets, recovery codes or `content.export.ts` containing anything private.

## Context discipline
Each phase in `docs/PHASES.md` has a **Read:** line. At the start of a phase, read `CLAUDE.md` + exactly
those docs. Don't load everything again. If you need another doc, say which and why.

## Phase workflow
- Exactly one phase per instruction (`docs/PHASES.md`), then STOP and report.
- Done = `npm run build && npm run lint && npx tsc --noEmit` pass, plus the phase's acceptance criteria are met,
  plus `CLAUDE.md` status below is updated.
- Wait for the owner's visual check before starting the next phase.

## Anti-hallucination
- Verify every package version with `npm view <pkg> version` at install time, and check peer deps.
- Verify every library API against installed `.d.ts` or official docs. If unsure, say so.
- If a requirement is ambiguous, ask one clarifying question instead of assuming.

## Quality bars
- HTML path First Load JS ≤ ~180 kB (target; report the actual number from `next build`).
- 60 FPS desktop, 30 FPS mobile floor. Instanced meshes, no per-frame allocations, single RAF loop, pause the
  render when the tab is hidden or the canvas is off-screen.
- WCAG 2.2 AA. Keyboard-complete. `prefers-reduced-motion` honored. Focus is visible and trapped in dialogs.
- Lighthouse ≥ 90 on Performance (mobile), Accessibility, Best Practices, SEO.

## Skills/plugins (use if present)
`superpowers` (planning), `impeccable` + `ui-ux-pro-max` + `frontend-design` (UI phases), `threejs-*` +
`motion-*` (3D/motion phases), `ecc:security-review` / `security-reviewer` (**mandatory** Phases 8, 9, 12),
`code-review` / `typescript-reviewer` (before declaring any phase done).

## Commands
dev `npm run dev` · build `npm run build` · lint `npm run lint` · types `npx tsc --noEmit` · test `npm test`

## Status (update as you go) — priority labels in docs/PHASES.md
- [x] 0 Preflight (docs/PHASE0_REPORT.md)  - [x] 0.5 Intake gate  - [x] 0.75 Design preview  - [x] 1 Scaffold + content + profile page  - [x] 2 SEO/AEO  - [ ] 2.5 First live deploy
- [ ] 3 Galaxy core  - [ ] 4 Regions  - [ ] 4.5 Journey + warp  - [ ] 4.75 Free-flight  - [ ] 4.8 Physics + interactions  - [ ] 4.9 Immersion pass  - [ ] 5 Case studies  - [ ] 6 ⌘K terminal
- [ ] 7 Teju mode  - [ ] 8 Edit backend  - [ ] 9 Edit UI  - [ ] 10 GitHub sync + ordering
- [ ] 11 Contact/résumé/UX extras/polish  - [ ] 12 Hardening + CI  - [ ] 13 Owner secrets + deploy
