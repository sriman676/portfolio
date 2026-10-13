# Extras — approved improvements

| # | Item | Phase |
|---|---|---|
| 1 | Design preview gate | 0.75 |
| 2 | Résumé PDF generated from content | 11 |
| 3 | Edit-mode version history, undo, export | 8–9 |
| 4 | Lab notes / write-ups section | 5 |
| 5 | Recruiter TL;DR block | 1 |
| 6 | Cross-browser + device test matrix | 12 |
| 7 | 3D chunk size budget | 3–4, enforced 12 |
| 8 | Case-study "What I'd do differently" | 5 |
| 9 | "Last updated" + stale reminder | 1, 9 |
| 10 | Print stylesheet | 11 |
| 11 | Verified platform badges | 1 |
| 12 | TOTP 2FA for edit mode | 8–9 (SECURITY.md §3.8) |
| 13 | `/.well-known/security.txt` | 12 |
| 14 | Dependency security (Dependabot, audit, lockfile) | 1 (CI), 12 |
| 15 | "Security of this site" page | 12 |
| 16 | Channel tracking (`?utm_source=`) | 11 |
| 17 | QR code on résumé | 11 |
| 18 | ~~Most-viewed panel in admin~~ dropped: use the Vercel Analytics dashboard | — |
| 19 | Real low-end Android test | 11 (owner-run) |

## 1. Design preview gate (Phase 0.75)
- Before any app code, Claude Code builds **two static HTML mockups** in `design/` (no framework, inline CSS,
  real content from `content.ts`, no 3D, with a CSS star background as a stand-in). Both follow SPEC §3
  tokens and type, and differ in layout/composition:
  - **A "Dossier":** single column, narrow measure, editorial rhythm, the black-hole hero as a full-bleed still.
  - **B "Console":** two-column on desktop (sticky identity rail on the left, content on the right),
    denser, more terminal-forward.
- Each mockup covers the black-hole hero (static still from the Design canvas "Cosmos v3 Theme" as reference) + TL;DR, Projects, Research, the ⌘K terminal (static open state) and the
  mobile width (390 px), shown side by side.
- The owner picks A, B or a mix, with notes. The choice is written to `docs/DESIGN_DECISION.md`. Phase 1
  must match it.
- Run the `frontend-design`, `impeccable` and `ui-ux-pro-max` skills while making them. Avoid the generic tells
  listed in SPEC §3.

## 2. Résumé PDF from content (Phase 11)
- Add a `/resume` route: a one-page, print-optimized HTML résumé rendered from `content.ts` (same data as
  the site). It uses only public, non-hidden, non-draft items, with the `featured` order.
- A script `scripts/build-resume.mjs` uses Playwright `page.pdf()` (verify the options in the Playwright docs)
  to write `public/resume.pdf`. It runs in CI and the commit is done by the owner, not automatically.
- `content.links.resume` points to it automatically once the file exists.
- Rule: if it doesn't fit on one page (A4 / Letter), CI fails with the overflow height. Trim content; don't
  shrink fonts below 9.5 pt.

## 3. Edit-mode version history, undo, export (Phases 8–9)
- Every write stores a snapshot in KV `history` (last 30, each `{ ts, action, slug, before, after }`).
- The editor gets an **Undo** button for the last change (60 s toast) and a **History** tab that can
  restore any snapshot (restoring is itself a new history entry).
- **Export** downloads `content.export.ts`: seed + all KV overrides merged, formatted like
  `seed/content.seed.ts`. The owner commits it to the repo periodically, so the repo stays the long-term
  backup.
- The editor shows "N unsaved-to-repo changes since last export" as a gentle reminder.
- No automatic GitHub commits (that would need a write token, which is a bigger risk than it's worth).

## 4. Lab notes / write-ups (Phase 5)
- New item `kind: "note"` with fields `title`, `date`, `tags`, `summary`, `body` (Markdown subset), and
  optional `relatedSlugs`.
- Sources: Markdown files in `content/notes/*.md` (frontmatter validated with zod) **and** edit mode.
- Pages: `/notes` (list, tag filter) and `/notes/[slug]`. Notes appear in ⌘K (`notes` command) and as tiny
  dim stars linked to their related projects.
- Suggested first notes (owner writes them; never generated): detection rules from the SOC lab (with ATT&CK
  IDs), one HTB/THM write-up, and the FedDecept negative result.
- No notes = the section is hidden (no empty state on the public site).

## 5. Recruiter TL;DR (Phase 1)
- Directly under the hero: up to 3 short proof lines from `content.tldr` (e.g. papers under review,
  internship, open-source count). Owner-approved text only.
- These are also used in OG descriptions, `/llms.txt` and `neofetch`.

## 6. Test matrix (Phase 12)
- Playwright projects: Chromium, Firefox, WebKit (Safari engine), Pixel 7 and iPhone 14 emulation (verify
  the device names in Playwright's device list).
- Each runs the smoke suite. WebKit and mobile also assert that the galaxy falls back to the 2D map cleanly
  if WebGL fails (simulated).
- Visual snapshots of `/` and one case study (tolerant threshold) to catch layout regressions.
- Accessibility scan with `@axe-core/playwright` (verify the package) on `/`, `/work/feddecept`, `/notes`,
  terminal open, and edit dialog open. Zero serious/critical violations.

## 7. 3D size budget
- Superseded by GALAXY §8 (INTAKE Q-002): per-chunk, per-tier budgets recorded in `budgets.json`, with a +10% ratchet
  instead of a fixed combined cap.
- Only tree-shakable drei imports are allowed. Report the chunk sizes from the build output (or
  `@next/bundle-analyzer`, verify) in Phases 3, 4 and 12. CI fails if the budget is exceeded by > 10%.

## 8. Case-study template
Sections: Problem · Approach · My role · Stack · Status · Results (if `metricsPublic`) ·
**What I'd do differently** (`content` field `retro`, owner-written; hidden if empty) · Links · Next/Prev.

## 9. Last updated
- `content.updatedAt` for Now and Availability. It shows as "Updated Oct 2026" (month precision).
- Edit mode shows a banner when Now/Availability is older than 60 days: "Your Now section is getting stale."
- `neofetch` and the status line show it too.

## 10. Print stylesheet
`@media print`: hide the 3D, terminal, nav and status line. Black on white, link URLs printed after the
link text, no page breaks inside items. It also serves as the base for `/resume`.

## 11. Verified platform badges
`content.profiles`: TryHackMe, HTB Academy, ORCID, GitHub. Each is a link to the owner's **real public
profile URL** (collected at intake). Show the platform name + handle only, not scraped stats (they go stale
and can't be verified at render time).

## 13. security.txt (RFC 9116)
- Served at `/.well-known/security.txt` (a route handler or a static file in `public/.well-known/`).
- Fields: `Contact: mailto:<content.links.email>`, `Expires:` (≤ 1 year ahead, ISO 8601, generated at build
  so it never goes stale), `Preferred-Languages: en`, `Canonical: <site>/.well-known/security.txt`,
  `Policy: <site>/security#disclosure`. Verify the field names against RFC 9116.
- Unit test: `Expires` is in the future and ≤ 365 days ahead.

## 14. Dependency security
- `npm ci` in CI (fails if `package-lock.json` is out of sync). The lockfile is always committed.
- `npm audit --omit=dev --audit-level=high` in CI. It fails on high or critical vulnerabilities in production
  deps. Dev-only findings are reported but don't fail the build.
- `.github/dependabot.yml`: `npm` and `github-actions` ecosystems, weekly, grouped minor/patch updates, max
  5 open PRs. Verify the schema in GitHub's Dependabot docs.
- Pin third-party GitHub Actions to a full commit SHA (with the version in a comment). Dependabot keeps
  those updated too.
- CI workflow `permissions: contents: read` (least privilege).
- When the security review skill runs (Phases 8, 9, 12), include the dependency audit output.

## 15. "Security of this site" page (`/security`)
- A plain-language write-up generated partly from content and config, so it stays accurate:
  - Architecture: static/server-rendered content, the lazy 3D layer, no cookies for visitors.
  - Headers: the actual CSP and security headers (render them from the same config object that sets them, so
    they can't drift).
  - Edit mode design: passphrase (Argon2id) + TOTP 2FA, signed short-lived session, rate limiting, Origin
    checks, zod validation, text-only rendering, audit log, version history. Kerckhoffs's principle applies:
    describing the design is safe, and secrets are never shown.
  - What visitors' data is collected (Vercel Analytics + Speed Insights, aggregate, no cookies; the optional
    `perf_tier` event fields) and what isn't.
  - Supply chain: lockfile, audit and Dependabot (§14).
  - `#disclosure`: how to report a vulnerability (links to security.txt contact). Be honest that there is
    no bug bounty.
- **Do not mention**: the trigger mechanism, Teju mode, env var names, or KV key names.
- Linked from the footer and the terminal (`security` command, and `cat security.txt` prints the file).
- Owner reviews the final text at the Phase 12 report.

## 16. Channel tracking (`?utm_source=`)
- The owner shares links with `?utm_source=<channel>` (whitelist in `content.refs`: `linkedin`, `resume`,
  `resume-qr`, `email`, `github`, `cover-letter`, `referral`). This is the standard format analytics tools
  understand.
- **No custom write path.** Vercel Analytics records the visit. **Verify** in the current Vercel docs whether
  the Hobby plan shows UTM / query data and custom events; I'm not certain. Report what's available.
  - If UTM data is shown: done. Let the pageview fire first, *then* strip the param with
    `history.replaceState` so re-shared links stay clean (verify the ordering doesn't lose the data).
  - If it isn't shown on Hobby: keep the links anyway (harmless, and they start working if the plan changes),
    and rely on the Referrers panel. Don't build a custom counter.
- Never put anything except a whitelisted channel name in the param.

## 17. QR code on résumé
- `scripts/build-resume.mjs` adds a small QR (≈ 2 cm) in the résumé header pointing to
  `<site>/?utm_source=resume-qr`, with the plain URL printed next to it.
- Generate it as an SVG at build time with a verified QR package (e.g. `qrcode`: verify its API) or a small
  vetted implementation. Test that it decodes to the exact URL (Playwright or a decoder in the test).

## 18. Most-viewed (dropped as a custom feature)
Use the Vercel Analytics dashboard: the Pages panel filtered to `/work/` and `/notes/` shows which case studies
recruiters open. No beacon, no counters, no second write path. Decision: the security and simplicity of a
single write path outweigh an in-admin chart.

## 19. Real low-end Android test (owner-run checklist)
On a real mid/low-range Android phone (Chrome), on mobile data or with DevTools remote throttling set to a
slow 4G profile:
- [ ] First content visible in ≤ ~3 s (rough target; record the actual time)
- [ ] Black hole, scroll journey and tap-to-warp: smooth or correctly downgraded to the low tier, with no jank while scrolling
- [ ] ⌘K terminal opens from the search button, the keyboard doesn't cover the input, chips are tappable
- [ ] Teju mode runs smoothly (or falls back) and music plays after typing
- [ ] Résumé downloads and opens
- [ ] Phone stays cool and battery drain is reasonable after 3 min of the scroll journey
Claude Code provides the remote-debugging steps (verify `chrome://inspect` usage in Chrome docs) and records the
results in the Phase 11 report.
