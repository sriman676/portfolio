# Writing Guide — how to answer INTAKE.md fast and well

Recruiters skim. Every line should answer one of three questions: **what is it, what did *you* do, how do I
know it's real.**

## 1. Project blurb (≤ 2 sentences, ≤ 300 chars)
Formula: **[What it is] that [does what] for [whom / what problem]. [One concrete proof or status].**
- ✅ "FastAPI middleware that blocks prompt-injection attacks on AI agents and flags behavioural drift.
  Open source, with tests against <named attack set>."
- ❌ "A cutting-edge, AI-powered, next-gen security solution leveraging LLMs." (says nothing)
- Lead with the noun ("Middleware…", "A simulator…"), not "This project…".
- One technical detail beats three adjectives.

## 2. Your role (team projects)
State *your* part in one line: "Designed the split-learning cut-layer experiments and the explainability
module (team of 5)." Never imply you built the whole thing alone.

## 3. Impact lines (TL;DR, experience)
**Verb-first, past or present tense, concrete object:** "Built…", "Designed…", "Correlated…", "Evaluated…".
- Numbers only if they're real and you can show where they come from. No number is better than a soft number.
- Avoid: "passionate", "leveraged", "synergy", "cutting-edge", "robust" (unless it's a technical claim you
  measured), "expert in".

## 4. Research status: exact wording
| Situation | Write | Never write |
|---|---|---|
| Submitted, awaiting decision | "Under review" (optionally "at a journal" / "at a conference") | "Accepted", "Published", or the venue name as if accepted |
| Drafting | "In preparation" | "Forthcoming" |
| Accepted, not yet out | "Accepted, to appear in <venue>" (only with the acceptance email in hand) | — |
| Out | "Published in <venue>, <year>" + DOI link | — |
| Preprint | "Preprint" + arXiv link | "Published" |
Don't name a venue you're under review at unless you're comfortable with a rejection being visible later.

## 5. Metrics
Show only metrics you approved (`metricsPublic: true`). Give each one its condition: "≈ 48% improvement over
isolated operation (8 seeds)". Always state the baseline it's compared against.

## 6. "What I'd do differently" (case studies)
1–3 honest sentences: a limitation, a wrong assumption, or a cut feature. Example pattern: "I'd test X earlier;
I spent two weeks on Y before measuring that it didn't help." This reads as judgment, not weakness.

## 7. Bio (2–3 sentences, first person)
Who you are (one clause) → what you work on (one sentence) → what you're looking for (one clause).
Read it aloud. If you wouldn't say it in an interview, rewrite it.

## 8. Teju letter
Your own words, no guide needed. Just remember: anyone who types the word can read it.

## 9. Before you write `approve` on any PROPOSED text, check
- [ ] Every claim is something I can defend in an interview
- [ ] No number without a source
- [ ] Status wording matches §4 exactly
- [ ] No buzzwords from §3
- [ ] Team work says "team of N" + my part
