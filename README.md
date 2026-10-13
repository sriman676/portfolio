# Cosmos v3 — Claude Code Build Kit

Fresh-repo rebuild of Sriman's portfolio: a 3D space-themed, recruiter-first site: a black-hole hero, a galaxy where every
section is its own celestial body, light-speed warps, opt-in free-flight, ⌘K terminal, secret edit mode, and Teju mode.

## Files
| File | Put it where | Purpose |
|---|---|---|
| `MASTER_PROMPT.md` | paste into Claude Code (first message) | Kicks off the build, points at the docs |
| `CLAUDE.md` | repo root | Standing rules Claude Code reads every session |
| `docs/SPEC.md` | `docs/` | Full product + design + technical spec |
| `docs/PHASES.md` | `docs/` | One prompt per phase + acceptance criteria |
| `docs/GALAXY.md` | `docs/` | The 3D galaxy: regions, scroll journey, warps, free-flight, tiers |
| `docs/PHYSICS.md` | `docs/` | Custom lightweight physics + 7 interactions (fling, spin, gravity well, ship…) |
| `docs/SECURITY.md` | `docs/` | Edit-mode threat model + required controls |
| `docs/TEJU_MODE.md` | `docs/` | Love-mode sequence spec |
| `docs/TERMINAL.md` | `docs/` | ⌘K terminal: commands, fun commands, UX additions |
| `docs/EXTRAS.md` | `docs/` | Approved improvements (design gate, résumé, backups, notes, 2FA, security.txt, supply chain, /security page) |
| `docs/BREAK_GLASS.md` | `docs/` | What to do if you lose 2FA, forget the password, or a secret leaks |
| `docs/WRITING_GUIDE.md` | `docs/` | How to write blurbs, status wording, metrics, bio. Read before intake |
| `docs/INTAKE.md` | `docs/` | Questionnaire Claude Code generates; you answer before any build |
| `seed/content.seed.ts` | `src/data/content.ts` | Your real content (verify every line) |
| `.env.example` | repo root | Env vars (no secrets in it) |

## How to run
1. `mkdir cosmos-v3 && cd cosmos-v3 && git init`
2. Copy these files in (paths above).
3. Optional: copy your useful skills from the old repo:
   `cp -r ../portfolio/.agents/skills/{threejs-*,motion-*,framer-motion,ui-ux-pro-max,design-audit} .agents/skills/`
   and `cp -r ../portfolio/.claude/skills/impeccable .claude/skills/`
4. Open Claude Code in the folder and paste `MASTER_PROMPT.md`.
5. Reply `Go Phase 0.5`. Claude Code pulls your GitHub repos + READMEs and writes every question into
   `docs/INTAKE.md`. Answer each one (or write `hide`), then say `intake done`.
6. Claude Code then builds two design mockups (Phase 0.75). Pick one.
7. Once intake and design are both approved, send phases one at a time: `Run Phase 1 from docs/PHASES.md`.
8. After every phase, check `npm run dev` yourself before sending the next one.

## What intake will ask you (preview)
- Edit-mode trigger word → set in Phase 13 (env var, you never type it into a file).
- Edit passphrase → Phase 13.
- Teju love letter text, Yes-screen text.
- Paper details for AXON, SIGMA, ARIA, IMAP; cert issuers/links; headshot; resume.pdf.

## Timeline at a glance
`0 preflight → 0.5 intake → 0.75 design → 1 → 2 → 2.5 LIVE on Vercel → 3 … 12 (each via PR + Preview) → 13 secrets`
Your site is shareable from Phase 2.5. Everything after that upgrades it in place.

## One-time cleanup (do these yourself)
- [ ] After v3 is live: archive the old `portfolio-main` repo on GitHub (Settings → Archive), or make it private
- [ ] Update the website link on LinkedIn, GitHub profile, ORCID and your résumé to the new URL, using
      `?utm_source=linkedin`, `?utm_source=github` etc. so tracking works
- [ ] Ask one senior engineer or mentor to review the live site (content, clarity, anything that looks
      overclaimed) before sharing it widely
- [ ] Turn on 2FA for your Vercel and GitHub accounts. They're the final recovery path (BREAK_GLASS.md)
- [ ] Print BREAK_GLASS.md + your recovery codes and keep them offline
