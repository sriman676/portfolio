# Design decision (Phase 0.75)

**Chosen: B "Console"** (owner, chat 2026-10-13: "Go Phase 0.75 and B"). Pending the owner's visual check of
`design/compare.html`; any notes go below and Phase 1 follows them.

**Deviation from EXTRAS §1 (owner-approved):** only mockup B was built. The owner picked B before the mockups
existed and chose "Only B, fully polished" over building A as well.

## What Phase 1 must match
- **Layout:** two columns on desktop: a sticky identity rail (360 px) on the left, content on the right
  (max 1360 px). Under 860 px the rail becomes the top of the page and the terminal is a bottom sheet.
- **Rail, top to bottom:** `whoami` prompt, holographic avatar (corner brackets, scanlines, cyan rim), name,
  pitch, availability badge, TL;DR (≤ 3 lines with `›`), Email me + Copy email, GitHub / LinkedIn / ORCID,
  "Type a command ⌘K" button, status line (local time, updated month). The résumé button joins the actions
  once the file exists (Q-007).
- **Content column:** black-hole band (the 3D layer replaces the CSS still in Phase 3), then Projects (featured
  rows + "More projects" chips + GitHub-only count), Research (rows with status badge and approved metrics),
  Contact.
- **Section labels:** each `h2` is paired with the real ⌘K command that shows it (`$ projects --featured`,
  `$ papers`, `$ contact`), right-aligned. No caps eyebrows, no numbered markers, no card grids.
- **Rows, not cards:** hairline `--line` separators, title + sub line, blurb (≤ 72ch), mono skill tags,
  one status badge (SPEC §3.4 colours; "On GitHub" neutral, "Proposal" nebula).
- **The one bold element** is the holographic avatar; everything else stays quiet.

## Tokens and type (unchanged from SPEC §3.1–3.2)
Extra neutrals used for borders: `--line` #1E2742, `--line-2` #2A3557 (from the Theme canvas). IBM Plex Sans
300/400/500/600, IBM Plex Mono 400/500 only for terminal output, commands, statuses, metrics and the clock.

## Contrast (WCAG 2.2 AA, computed)
| Text | on `--space-0` | on `--space-1` | on `--space-2` |
|---|---|---|---|
| `--starlight` #E7ECF5 | 16.97 | 15.97 | 14.54 |
| `--dust` #9AA4BD | 8.07 | 7.59 | 6.91 |
| `--signal-done` #6FE3E9 | 13.26 | 12.48 | 11.36 |
| `--signal-wip` #F2B84B | 11.24 | 10.58 | 9.63 |
| `--nebula` #8B6CFF (focus ring) | 5.45 | 5.13 | 4.67 |
Primary button text `--space-0` on `--signal-done`: 13.26. All ≥ 4.5:1.

## Owner notes
- 2026-10-13: approved by the owner after the visual check of `design/compare.html`.

- 2026-10-13: terminal → warp flow changed (GALAXY §4): genie-minimize into the "Type a command ⌘K" button,
  light-speed warp, region opens, terminal stays minimized showing `docked at: <region>`. The rail button in
  `design/b-console.html` is where the terminal docks.
- 2026-10-13: one screen, one scrollbar: the rail is pinned without its own scrollbar (falls back to scrolling
  with the page on screens under 800 px tall). World-first model added (GALAXY §2.1, reference bruno-simon.com):
  the 3D galaxy is the default view and this B layout becomes "page mode" behind a "Read as page" button,
  and the forced view for low tier, no WebGL, reduced motion and no JS.
- 2026-10-13: no divider line, no separate rail background, no line under the black hole: the page reads as
  one continuous screen.
