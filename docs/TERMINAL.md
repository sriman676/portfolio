# ⌘K Terminal — spec (governs SPEC §6)

## 1. Open / close
- Opens with `Ctrl+K`, `⌘K`, `/` (when focus isn't in an input), the header search bar (click/tap), or deep
  link `/?cmd=<url-encoded command>`.
- Closes with `Esc`, the `exit` command, the × button, or a click outside. Focus returns to the element that
  opened it.
- Opening animation: 160 ms scale/fade. With reduced motion it appears instantly.

## 2. Look (hybrid: terminal look, clickable results)
```
┌─ sriman@cosmos: ~ ───────────────────────────── [esc] ┐
│ sriman@cosmos:~$ open fed█                            │
│                   feddecept    ← ghost text, Tab fills │
│ ───────────────────────────────────────────────────── │
│ ▸ FedDecept     paper · under review         ↵ open   │
│   feddecept --metrics                        ↵ show   │
│ ───────────────────────────────────────────────────── │
│ [help] [projects] [resume] [contact] [tour] [galaxy] [fly]  │
│ ↑↓ history · Tab complete · ↵ run · ? shortcuts        │
└───────────────────────────────────────────────────────┘
```
- Plex Mono, `--space-1` background, `--signal-done` prompt, `--dust` hints, blinking block caret (static
  under reduced motion). Width `min(720px, 94vw)`, max height `70vh`. On mobile it's a bottom sheet, the
  chips row scrolls horizontally, and tap targets are ≥ 44 px.
- Output area (scrollback) above the prompt shows printed command output (`whoami`, `neofetch`, `help`…).
  The result list below the prompt shows live suggestions as you type.
- **Plain words work too**: typing `fed` with no command searches everything (same as `search fed`).

## 3. Engine
- **Fake shell.** `src/lib/terminal/commands.ts` is a typed table: `{ name, aliases, args, summary, man,
  run(ctx) }`. The parser splits on whitespace, respects quotes, and supports `--flags`. Nothing is ever
  passed to `eval`, `Function` or HTML. Output is React nodes built from content data.
- **Autocomplete:** Tab completes the command, then the argument (item slugs, section names, flags). Ghost
  text shows the top completion, and double-Tab lists all completions.
- **History:** `↑`/`↓` step through it. Up to 50 entries in `localStorage` (`term.history`, try/catch).
  **Secret phrases are never stored, never echoed, and never shown in `history`.**
- **Typos:** Levenshtein ≤ 2 against command names → `Unknown command 'projcts'. Did you mean 'projects'?`
  (clickable).
- **Secret phrases:** each submitted line, and live input after a 300 ms debounce, is normalized (NFKC → trim →
  lowercase) and SHA-256 hashed, then compared to the edit-trigger hash and `HEART_HASH`. On a match: clear the input, add
  nothing to history or scrollback, send no analytics, then hand off (passphrase dialog / Teju mode).
- **A11y:** ARIA 1.2 combobox + listbox for suggestions, and an `aria-live="polite"` log for scrollback output.
  Focus is trapped. Every chip and result is a real `<button>`.

## 4. Commands
Commands with a 3D destination warp there first (GALAXY §3–§4). The terminal genie-minimizes into the ⌘K button
during the warp and stays minimized on arrival (`docked at: <region>`); the button or ⌘K reopens it.
| Command | Aliases | Does |
|---|---|---|
| `help` | `?` (in palette) | Grouped list of commands, each clickable |
| `man <cmd>` | | Usage, flags and an example for one command |
| `ls` | | Lists page sections |
| `cd <section>` | `goto` | Closes the palette and smooth-scrolls to the section (instant under reduced motion) |
| `open <item>` | | Opens a case study `/work/<slug>`. Fuzzy arg match |
| `projects [--featured\|--recent\|--stars\|--all]` | `ls projects` | Prints the list in current ordering (SPEC §4.5) |
| `papers` | | Papers with status badges |
| `<item> --metrics` | | Prints metrics **only if `metricsPublic`**, else "No public metrics yet." |
| `skills` | | Grouped skills |
| `certs` | | Certs with earned/in-progress status and verify links |
| `now` | | Prints `content.now` |
| `whoami` | | Name, pitch, location, availability |
| `search <term>` | (bare words) | Fuzzy search across everything |
| `resume [--preview]` | `cv` | Downloads, or `--preview` opens the résumé preview panel (feature F). Hidden if no résumé |
| `contact` | `email` | Copies the email + toast, and shows LinkedIn/GitHub/ORCID buttons |
| `github` / `linkedin` / `orcid` | | Opens in a new tab (`rel="noopener noreferrer"`) |
| `share <item>` | | Copies the deep link `https://<site>/work/<slug>` (feature C) |
| `galaxy` | `map`, `sky`, `constellation` | Wide galaxy shot + minimap (warps per GALAXY §4) |
| `fly` | `launch` | Free-flight mode (desktop only) |
| `experience [<org>]` | | Warps to the stations and docks (GALAXY §4) |
| `research` | `papers` | Warps into the research nebula |
| `tour` | | Starts the guided 30-second tour (feature D) |
| `security` | `cat security.txt` | `security` opens `/security`; `cat security.txt` prints the file |
| `history` | | Prints history (secrets never included) |
| `clear` | `Ctrl+L` | Clears scrollback |
| `exit` | | Closes |
| **Fun** | | |
| `neofetch` | | ASCII black-hole logo + profile card: name, role, location, focus areas, "uptime" (since 2024), papers under review count, projects count, availability, plus a color swatch row in the theme tokens. All data from content |
| `sudo hire-sriman` | `sudo hire-me` | Fake `[sudo] password for recruiter:` (masked dots animate) → `Access granted.` → prints `content.terminal.hireMessage` + contact buttons. No real auth |
| `matrix` | | 5 s rain overlay in `--signal-done`, using glyphs from your skills list. Any key or Esc stops it. Reduced motion → prints "Follow the white rabbit 🐇" instead |
| `sudo <anything else>` | | `Nice try. This incident will be reported.` 🙂 |
| `rm -rf /` | | `Permission denied: the cosmos is read-only.` |

## 5. UX additions (all approved)
- **A. Chips + quick actions:** a chips row is always visible. On empty input the result list shows Quick
  actions: Download résumé, Copy email, Featured projects, Start tour.
- **B. Status line** (fixed bottom bar on desktop ≥ 1024 px, hidden on mobile): local time in Hyderabad (IST,
  `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`, updates each minute), current section (scroll-spy),
  `explored 4/12` stars, and the availability badge (`content.availability`, hidden if `open: false`).
  It's `aria-hidden` except for the badge, since the info is duplicated elsewhere.
- **C. Deep links + share:** `/?cmd=` runs a whitelisted, non-destructive command on load (`open`, `cd`,
  `projects`, `papers`, `galaxy`, `experience`, `tour`). Secret phrases and `sudo` are **never** accepted via URL. Each
  case study has a "Copy link" button.
- **D. Guided tour** (`tour` command or chip): about 30 s, steps Hero → Now → Featured projects → Research →
  Contact. Each step scrolls, spotlights the section (dimmed backdrop) and shows a one-line caption from
  content. Controls: Next / Back / Skip, arrow keys, Esc. Reduced motion → jump-cut instead of scroll. Shown
  once as a dismissible hint on first visit: "New here? Type `tour`".
- **E. Scroll-spy side nav + shortcut sheet:** a slim right-edge dot nav (desktop) highlights the current
  section. Labels show on hover/focus. The `?` key opens a shortcuts sheet: ⌘K, /, ?, g p (projects),
  g r (research), g c (contact), Esc.
- **F. Résumé preview:** a panel with the PDF in an `<iframe>`/`<object>` (falls back to a download link), plus
  "Download" and "Copy email" buttons. CSP must allow it (`object-src`/`frame-src 'self'`; adjust in Phase 12).

## 6. Acceptance
- Every command in §4 works by typing **and** by clicking. Each has a `man` page.
- Tab completion, history, typo suggestion and bare-word search all work.
- After typing either secret word, `localStorage term.history` and the scrollback don't contain it (unit +
  Playwright test).
- `/?cmd=sudo%20hire-sriman` and secret words via URL are ignored. `/?cmd=open%20feddecept` works.
- Screen reader announces command output. Keyboard-only use covers every feature.
- The palette chunk is lazy-loaded on first open (or idle prefetch). `/` First Load JS impact ≤ 10 kB.
