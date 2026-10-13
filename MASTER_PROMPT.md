# MASTER PROMPT — paste this as your first message in Claude Code

You are building **Cosmos v3**, a new portfolio for Sriman Rutvik Voddiraju, in this fresh repo.

Before doing anything:
1. Read `CLAUDE.md`, then `docs/SPEC.md`, `docs/GALAXY.md`, `docs/PHYSICS.md`, `docs/SECURITY.md`, `docs/TEJU_MODE.md`, `docs/TERMINAL.md`, `docs/EXTRAS.md`, `docs/BREAK_GLASS.md`, `docs/WRITING_GUIDE.md`, `docs/INTAKE.md`,
   `docs/PHASES.md`, and `seed/content.seed.ts`. Do not skim.
2. List the skills and plugins available in this environment (`.agents/skills`, `.claude/skills`, `/plugin`).
   For each phase, name which ones you will use. If one is missing, skip it gracefully.
3. Reply with:
   - a 10-line summary of what you understood,
   - every conflict, gap or ambiguity you found across the docs (numbered),
   - each package you intend to install, with the version you verified via `npm view <pkg> version`
     and its peer dependencies (R3F major must match React major),
   - any question you need answered before Phase 1.

Then STOP. Write no code until I reply "Go Phase 0.5".
Phase 1 may not start until Phase 0.5 (intake) passes `check-intake` AND Phase 0.75 (design preview) is approved. Refuse if I ask to skip it, and remind me why.

Standing orders for the whole build:
- One phase per instruction. At the end of each phase, run `npm run build && npm run lint && npx tsc --noEmit`,
  fix everything, then report against that phase's acceptance criteria and STOP.
- Never invent APIs. Check `node_modules/**/*.d.ts` or the official docs and say you verified.
- Never invent facts about me. Every unknown goes into `docs/INTAKE.md` as a question. You may propose
  wording (marked PROPOSED), but only my `approve` makes it real.
- If you hit an architectural decision the docs don't cover, propose two options with tradeoffs and ask.
