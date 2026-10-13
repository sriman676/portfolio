# INTAKE — the owner answers everything here before Phase 1

Claude Code generates this file in **Phase 0.5** by scanning `src/data/content.ts`, every `TODO(owner)` and
`VERIFY`, all open questions from Phase 0, and the GitHub sync (repo list + READMEs). The owner answers inline.
Claude Code applies the answers, then `npm run check:intake` must pass before Phase 1 can start.

**Before answering, read `docs/WRITING_GUIDE.md`.** Claude Code's PROPOSED text must follow it too.

## Rules
- Every entry gets exactly one of these:
  - **an answer**, or
  - **`hide`**, meaning the item is kept but never shown publicly. It can be unhidden later in edit mode.
- Accepting a README draft = write `approve` (or edit the text, then `approve`).
- Blank = not answered. The gate fails.
- Claude Code never fills an answer itself. It may **propose** text (marked `PROPOSED:`), which counts only
  after the owner writes `approve`.

## Format (Claude Code generates one block per open item)
```
### [Q-012] item: soc-agentlab · field: status
Context: repo "SOC", last pushed 2026-xx-xx, README says "…" (quoted ≤ 2 lines)
Options: shipped | in-progress | hide
PROPOSED: in-progress   (reason: last push < 60 days)
ANSWER: whichever you feel is best   (owner, chat 2026-10-13)
```

## check:intake (script spec — `scripts/check-intake.mjs`)
Fails (exit 1) and lists every offender if any of these hold:
- `content.ts` contains `TODO(owner)` or `VERIFY` in an item that is not `hide: true`
- any item has `draft: true` and is not hidden
- `INTAKE.md` has an `ANSWER:` line that is empty
- a synced repo has no decision (it's not in the seed, not in `hiddenRepos`, and has no approved entry)
Runs in CI. In Phase 1+ it also runs as `prebuild` with `--prod` (ignored in `next dev`).

---

# Generated 2026-10-13 (Phase 0.5)
Sources: `src/data/content.ts` (copied from the seed), `docs/PHASE0_REPORT.md`, GitHub
`GET /users/sriman676/repos` (18 repos, snapshot in `docs/intake/github-repos.json`) and each repo's README
(fetched from raw.githubusercontent.com). Write your answer after `ANSWER:` on the same line or the lines below it.
Statuses are never inferred: where no PROPOSED line is given, pick from the options.

## 1. Phase 0 open questions

### [Q-001] decision: Next.js version
Context: spec says Next 15; latest stable is 16.4.0 (PHASE0_REPORT §6.1).
ANSWER: 16.4 (owner, in chat 2026-10-13)

### [Q-002] decision: 3D bundle budget
Context: GALAXY §8 says ≤ ~350 kB, EXTRAS §7 says ≤ ~250 kB. You answered in chat: "do it dynamic instead of static".
My reading, please confirm or correct:
PROPOSED: No single fixed kB cap. The 3D code is split by tier and loaded only when needed: low tier loads 0 kB
of 3D; medium loads the core galaxy chunk; high additionally loads a separate post-processing chunk; free-flight,
physics and Teju mode are their own chunks loaded on use. Each chunk's real gzipped size is measured in Phase 3 and
recorded in `budgets.json`; CI fails if any chunk grows > 10% over its recorded size (a ratchet), and the owner
approves any intentional raise.
Options: approve | something else (describe)
ANSWER: approve (owner, chat 2026-10-13: "Do whichever is best" → the PROPOSED per-chunk ratchet)

### [Q-003] decision: physical accuracy of the 3D scene + the low-tier hero image
Context: you answered in chat: "customize each and every detail … using maths and physics replicate the accurate
objects lighting and effects of light speed". The spec currently uses artistic approximations. My reading:
PROPOSED (3D scene, high/medium tier):
- Black hole: Schwarzschild metric. Shadow radius √27·GM/c² (≈ 2.6 r_s), photon ring at 1.5 r_s, accretion disk
  from the ISCO (3 r_s) outward with a thin-disk temperature profile T ∝ r^-3/4 mapped to blackbody colour,
  relativistic Doppler beaming (intensity × D³) and gravitational redshift √(1 − r_s/r). Lensing on the high tier by
  bending rays per pixel in the shader (numerical geodesic step), so the far side of the disk appears above and
  below the shadow, like the Interstellar render.
- Light-speed warp: star positions follow relativistic aberration cos θ' = (cos θ + β)/(1 + β cos θ), so stars
  crowd toward the direction of travel, and they shift blue ahead / red behind with the relativistic Doppler factor,
  on top of the streak effect in GALAXY §3. β ramps 0 → ~0.99 during the jump.
- Planets and stations: Lambert + Fresnel-rim lighting from the host star, Rayleigh-style atmosphere scattering on
  near-LOD planets, star colours from real blackbody temperatures (≈ 3,000 K to 30,000 K).
- Orbits follow Kepler's third law (period ∝ a^1.5) and the physics engine (PHYSICS.md) stays as specified.
PROPOSED (low tier / WebGL off): no photo and no hand-made image. `scripts/render-hero-still.mjs` is a pure-Node
ray tracer (no WebGL, no dependency) that integrates light paths around the black hole with the same equations and
writes the hero still as an image. The owner runs it and commits the output (like the résumé PDF), so it's
mathematically identical to the live scene and costs nothing at runtime.
The governor (GALAXY §12) still steps effects down on slow GPUs, so accuracy never costs the 60 FPS bar.
Options: approve | approve with changes (describe) | keep the spec's artistic approximations
ANSWER: approve (owner, chat 2026-10-13: "it is good")

### [Q-004] decision: spec conflicts with a proposed resolution (PHASE0_REPORT §6)
Context and proposals:
- §6.5 FPS downgrade: GALAXY §12 wins (< 50 FPS for 3 s), SPEC §5.3's "< 40" is replaced.
- §6.6 `papers` prints the paper list *and* warps to the nebula; `research` is its alias.
- §6.8 Medium-tier vignette is a CSS overlay; `@react-three/postprocessing` stays high-tier only.
- §6.9 No drei `ScrollControls`; the journey uses native scroll + ScrollTrigger + Lenis.
- §6.11 SPEC §13 file tree is treated as non-exhaustive; the phase docs win.
Options: approve all | approve except (list numbers + what you want instead)
ANSWER: find the best option and choose it   (owner, chat 2026-10-13)

## 2. Person

### [Q-005] item: person · field: bio
Context: seed draft, built only from facts you stated (WRITING_GUIDE §7: who → what → looking for).
PROPOSED: I'm a B.Tech CSE (Cybersecurity) student at SRM University AP. I work on identity-centric security, federated learning for cyber deception, and guardrails for AI agents. I run a home SOC lab and build detection rules mapped to MITRE ATT&CK.
Options: approve | your own 2–3 sentences
ANSWER: Something like Hii fellows Sriman here then that details   (owner, chat 2026-10-13)

### [Q-006] item: person · field: photo (headshot)
Context: until set, the site shows a monogram.
Options: a file you'll add at `/public/<name>.jpg` (give the name) | none (monogram)
ANSWER: d:\autoadjusted.jpeg make this into 3D if possblie and if it is good   (owner, chat 2026-10-13)

### [Q-007] item: links · field: resume
Context: the résumé button stays hidden until a file exists. EXTRAS §2 generates `/resume.pdf` from content in Phase 11.
Options: generated in Phase 11 | I'll add my own `public/resume.pdf` (when?) | none
ANSWER: i will give this at the end   (owner, chat 2026-10-13)

### [Q-008] item: faq · field: "What roles is he looking for?"
Context: seed example "internships / roles in SOC, detection engineering, and AI security — remote-friendly".
Options: your answer (one sentence) | hide this FAQ entry
ANSWER: SOC, AI and Agentic AI and AI Security internships and also remember through admin i can edit this and jobs   (owner, chat 2026-10-13)

## 3. Experience

### [Q-009] item: experience fnCyber · field: summary
Context: Cyber Security Intern, since 2026-07. 1–2 verb-first lines, only what you're allowed to share.
ANSWER: SRM Summer Resarch Internship 3 months July to aug 2026 and CyberSecurity Intern at FnCyber for Aug to Oct 2026 and also remember through admin i can edit this   (owner, chat 2026-10-13)

## 4. Education

### [Q-010] item: education SRM University AP · field: cgpa + showCgpa
Context: shown only if you say yes.
Options: exact CGPA + show yes/no | hide CGPA
ANSWER: 8.35 and also remember through admin i can edit this   (owner, chat 2026-10-13)

## 5. Papers

### [Q-011] item: axon · field: blurb (summary + venue type)
Context: status already "under-review"; seed note says "venue type (journal)". Don't name the venue unless you're
fine with a rejection being visible later (WRITING_GUIDE §4).
Options: one-line summary | hide
ANSWER: underreviw type journal   (owner, chat 2026-10-13)

### [Q-012] item: axon · field: skills
Options: comma-separated list | hide
ANSWER: whichever you feel is best   (owner, chat 2026-10-13)

### [Q-013] item: sigma · field: status
Context: "Semantic Intent Governance for Multi-Agent Authorization", formal framework + Python scaffold.
Options: under-review | in-preparation | published (with DOI) | hide
ANSWER: no need remove it   (owner, chat 2026-10-13)

### [Q-014] item: aria · field: subtitle (expansion check)
Context: seed says "Agentic Runtime Intent Architecture", marked VERIFY.
Options: correct | the right expansion
ANSWER: no need, remove it   (owner, chat 2026-10-13)

### [Q-015] item: aria · field: status + blurb
Options: status (under-review | in-preparation | published) + one-line summary | hide
ANSWER: no need remove it   (owner, chat 2026-10-13)

### [Q-016] item: imap · field: subtitle (expansion check)
Context: seed says "Bio-inspired authentication", marked VERIFY.
Options: correct | the right expansion
ANSWER: no need remove it   (owner, chat 2026-10-13)

### [Q-017] item: imap · field: status + blurb
Options: status (under-review | in-preparation | published) + one-line summary | hide
ANSWER: no need remove it   (owner, chat 2026-10-13)

### [Q-018] item: unquestioned-rumor · field: keep on a security portfolio?
Context: sole-author conceptual psychology paper, in preparation.
Options: keep | hide | delete
ANSWER: keep it   (owner, chat 2026-10-13)

### [Q-019] item: feddecept · field: role (co-author naming)
Context: "First author, with Lakshmi Rishitha Dintakurthi and Naga Sravya Nanduru; supervised by Dr. Satish
Anamalamudi", marked VERIFY: are they OK being named?
Options: yes, keep names | "First author, team of 3" without names | other wording
ANSWER: yes it is good   (owner, chat 2026-10-13)

### [Q-020] item: feddecept · field: body (case-study write-up)
Context: optional. Seed note: "a self-tuning aggregator was cut after it showed no measurable benefit, and the
negative result is documented". Empty → the case study shows the blurb + "Write-up coming".
Options: your write-up text | empty for now
ANSWER: yes it is good   (owner, chat 2026-10-13)

## 6. Projects (seed)

### [Q-021] item: soc-agentlab · field: status
Context: repo "SOC", last pushed 2026-05-14. Description: "An OpenEnv-style simulation environment for training and
benchmarking AI agents on SOC (Se[curity Operations Center tasks])".
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-022] item: gardrail · field: status
Context: repo "GardRail", last pushed 2026-07-23. Description: "Enterprise-grade middleware that detects and blocks
prompt-injection attacks on AI agents …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-023] item: aegis · field: status
Context: repo "AEGIS", last pushed 2026-07-20. Description: "A hostile-by-default, zero-trust security platform that
governs autonomous AI coding agent[s] …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-024] item: nexus · field: status
Context: repo "NEXUS", last pushed 2026-07-17. Description: "Identity-centric cyber resilience platform for critical
infrastructure, combining anomaly …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-025] item: soc-automation · field: status
Context: repo "SOC_Automation", last pushed 2026-03-16. Description: "Python framework that ingests Windows
authentication logs (Event IDs 4624/4625), applies r[ules] …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-026] item: meshwork · field: status
Context: repo "meshwork", last pushed 2026-08-22. Description: "A private peer-to-peer mesh for sharing compute, GPUs,
and installed software with a close [group] …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-027] item: vishu · field: status
Context: repo "Vishu", last pushed 2026-09-28. Description: "A local-first personal-assistant AI that never hits a
rate limit — pool every provider key …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-028] item: bruteforce-sim · field: status
Context: repo "Adaptive-Brute-Force-Attack-Mitigation-Simulator", last pushed 2026-04-29. Description: "C++ simulator
demonstrating adaptive rate-limiting/lockout strategies to mitigate brute-fo[rce attacks] …"
Options: shipped | in-progress | hide
ANSWER: that is good (Q-021 to Q-028)   (owner, chat 2026-10-13)

### [Q-029] item: splitshield-xai · field: role (your part)
Context: "Team of 5 (SRM University AP)". State your part in one line (WRITING_GUIDE §2).
ANSWER: it is internship project   (owner, chat 2026-10-13)

## 7. Projects (GitHub-only repos not in the seed)
Each needs one decision. "show" uses the GitHub description as the blurb (SPEC §4.4) unless you approve the
README-based PROPOSED blurb, which only restates the README. Skills come from the repo language (no topics are set
on these repos). Status options: shipped | in-progress.

### [Q-030] repo: AI-image-caption-generator · decision
Context: last pushed 2026-04-15, Python. README: "Python project that generates natural language captions for images
using a CNN encoder and LSTM decoder." Workflow uses MobileNetV2 feature extraction.
PROPOSED blurb: Python tool that captions images using a CNN encoder (MobileNetV2 features) and an LSTM decoder.
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-031] repo: Anganwadi-ai · decision
Context: last pushed 2026-07-10, TypeScript. README: "Wadhwani AI Hackathon 2024 — Early Childhood Track. AI-powered
mobile app for India's 1.4M Anganwadi frontline workers."
PROPOSED blurb: AI-powered mobile app that helps India's Anganwadi frontline workers manage child nutrition and care. Built for the Wadhwani AI Hackathon 2024 (Early Childhood track).
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-032] repo: Appointment-System · decision
Context: last pushed 2026-05-03, JavaScript. README: "A comprehensive, full-stack appointment management system
built with React, Express.js, Node.js, and MongoDB." Roles: students, counselors/staff, admin.
PROPOSED blurb: Full-stack MERN appointment booking and management platform with role-based access for students, counselors and admins, real-time notifications and analytics dashboards.
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-033] repo: eco_optimizer · decision
Context: last pushed 2026-05-12, TypeScript. README: "an AI-assisted, real-time sustainability planning dashboard that
uses a greedy priority-weighted algorithm to find the most cost-efficient environmental actions across multiple domains".
Note: the README still has placeholder screenshot URLs (`YOUR_USERNAME/YOUR_REPO`) and a `#` live-demo link.
PROPOSED blurb: Sustainability planning dashboard that uses a greedy priority-weighted algorithm to recommend the most cost-effective environmental actions across five domains, with AI-written explanations (Next.js + FastAPI).
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-034] repo: Farmers_app · decision
Context: last pushed 2026-04-01, HTML. The README is empty (title only), so there's no README draft. GitHub
description: "Flask-based farm-to-consumer marketplace where verified farmers list produce directly to buyers, with
role-based auth (buyer/farmer/admin), farmer ID-proof verification, and an admin approval dashboard."
Options: show + status (uses the GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-035] repo: humanizer · decision
Context: last pushed 2026-04-13, Python. README: "a local Python tool that rewrites long-form text using a 3-stage
pipeline: LLM structural rewrite, LLM humanization rewrite, Python post-processing."
PROPOSED blurb: Local-first Python tool that rewrites long-form text through a three-stage pipeline (two local Ollama LLM passes, then Python post-processing), with a CLI and a Flask web UI.
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

### [Q-036] repo: trustnet · decision
Context: last pushed 2026-04-11, JavaScript. README: "a decentralized scam intelligence platform that combines a
Hardhat smart-contract layer with a Next.js frontend." Description adds Polygon Amoy, AI-assisted analysis, IPFS evidence.
PROPOSED blurb: Decentralized scam-intelligence platform with Solidity smart contracts for on-chain reporting and verification, a Next.js frontend, AI-assisted message analysis and IPFS evidence storage.
Options: show + status + (approve | edit the blurb | use GitHub description) | hide
ANSWER: keep them but either keep them at last and also remember through admin i can edit this (Q-030 to Q-036)   (owner, chat 2026-10-13)

## 8. Certifications

### [Q-037] cert: Google Cybersecurity Professional Certificate (v2) · field: verifyUrl
Options: Credly/Coursera verify link | no link
ANSWER: https://www.credly.com/badges/cb352130-5a8a-4393-8d06-ba9e379cc621/linked_in_profile   (owner, chat 2026-10-13)

### [Q-038] cert: Introduction to Cybersecurity · field: issuer + verifyUrl
Options: issuer + link (or "no link") | hide
ANSWER: https://www.credly.com/badges/12a7135e-2d4a-4f6f-abc3-385854591451/linked_in_profile   (owner, chat 2026-10-13)

### [Q-039] cert: Cyber Job Simulation (Deloitte Australia) · field: platform + verifyUrl
Options: platform (e.g. Forage) + link (or "no link") | hide
ANSWER: https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/E9pA6qsdbeyEkp3ti_9PBTqmSxAf6zZTseP_69d3af169ac693e04087bf8b_1775481805360_completion_certificate.pdf   (owner, chat 2026-10-13)

### [Q-040] cert: AI+ Skills Fest 2026 · field: issuer + verifyUrl
Options: issuer + link (or "no link") | hide
ANSWER: https://www.credly.com/badges/c2aeeb6e-6676-47d3-b33d-d07a576a4243/linked_in_profile   (owner, chat 2026-10-13)

### [Q-041] cert: PCAP Analysis · field: issuer + verifyUrl
Options: issuer + link (or "no link") | hide
ANSWER: https://app.letsdefend.io/my-rewards/detail/fda04217-86b4-4925-9f8c-9673e8e03a71 — new certs: Redhat https://www.credly.com/badges/d3c53686-d9c6-4998-9315-c5c9682994f7/linked_in_profile, AI Capabilities and Limitations by Anthropic https://verify.skilljar.com/c/uirgunibrawt, MongoDB Associate Developer https://www.credly.com/badges/5cd4c5b0-75f4-477e-8e8d-05a3b71a1668/linked_in_profile, SOC Member https://app.letsdefend.io/my-rewards/detail/ceffef63-5b6d-4856-973e-3fb610d39f7f, and also remember through admin i can edit this like add name and link   (owner, chat 2026-10-13)

## 9. Skills (keep only what you can defend in an interview)

### [Q-042] skills group: Security operations
Context: SOC operations, Detection engineering, Splunk, Wazuh, MITRE ATT&CK, Log correlation
Options: keep all | remove (list) | add (list)
ANSWER: keep all and also remember through admin i can edit this   (owner, chat 2026-10-13)

### [Q-043] skills group: AI security & ML
Context: Agentic security, Prompt-injection defence, Federated learning, Split learning, Explainable AI
Options: keep all | remove (list) | add (list)
ANSWER: keep all and also remember through admin i can edit this   (owner, chat 2026-10-13)

### [Q-044] skills group: Languages & tools
Context: Python, TypeScript, Rust, Go, C++, FastAPI, React, Flower
Options: keep all | remove (list) | add (list) | add a new group (name + items)
ANSWER: Python, C++ and also remember through admin i can edit this   (owner, chat 2026-10-13)

## 10. Ordering

### [Q-045] ordering · pinnedFirst / pinnedLast / preset
Context: seed: preset `featured-first`, pinnedFirst `hidra, feddecept`, pinnedLast empty. Presets: featured-first |
recently-updated | most-stars | manual.
Options: approve seed | your pins + preset
ANSWER: approved   (owner, chat 2026-10-13)

## 11. Teju mode
Anyone who types the trigger can read this text (TEJU_MODE §6): no surname, address, phone or dates.

### [Q-046] heart · field: letter
ANSWER: you give something   (owner, chat 2026-10-13)

### [Q-047] heart · field: yesMessage
ANSWER: you decide   (owner, chat 2026-10-13)

### [Q-048] heart · field: noLines
Context: default "Are you sure?", "Really sure?", "Think again 🥺", "Last chance…", "Okay, this one's a Yes too ❤️"
Options: keep | your lines (the last one turns No into Yes)
ANSWER: keep them   (owner, chat 2026-10-13)

## 11b. Terminal

### [Q-049] availability · open + text
Context: shown in the status line, `whoami` and `neofetch`. Seed example: "Open to SOC / AI-security internships (remote-friendly)".
Options: open yes + text | open no (badge hidden)
ANSWER: approved   (owner, chat 2026-10-13)

### [Q-050] terminal · field: hireMessage (after `sudo hire-sriman`)
Context: a short line on what you're looking for + the best way to reach you.
ANSWER: approved   (owner, chat 2026-10-13)

### [Q-051] terminal · field: tourCaptions (one line per step)
Context: steps hero → now → projects → research → contact.
PROPOSED:
- hero: "Start here: who I am and what I work on."
- now: "What I'm doing right now."
- projects: "Things I've built. Open any planet for the write-up."
- research: "Papers, each with its exact status."
- contact: "The fastest ways to reach me."
Options: approve | your captions
ANSWER: good but see if it can be improved or optimised   (owner, chat 2026-10-13)

## 11c. Extras

### [Q-052] tldr · up to 3 proof lines under the hero
Context: seed examples, built from facts you stated. Line 3's count depends on your §7 decisions (16 public non-fork
repos today, excluding `sriman676` and `portfolio-main`).
PROPOSED:
1. Two security papers under review: HIDRA (sole author) and FedDecept (first author).
2. Cyber Security Intern at fnCyber.
3. N open-source projects on GitHub (N filled in from your §7 decisions; not all are security projects).
Options: approve | edit lines | fewer lines
ANSWER: good approved   (owner, chat 2026-10-13)

### [Q-053] profiles · TryHackMe URL + handle
Options: public profile URL + handle | hide
ANSWER: no need remove them   (owner, chat 2026-10-13)

### [Q-054] profiles · HTB Academy URL + handle
Options: public profile URL + handle | hide
ANSWER: no need remove them   (owner, chat 2026-10-13)

### [Q-055] retro · "What I'd do differently" for featured items
Context: hidra, feddecept, soc-agentlab, gardrail, aegis, splitshield-xai. 1–3 honest sentences each (WRITING_GUIDE §6).
Options: text per slug | empty (section hidden) for any you skip
ANSWER: text per slug and also remember through admin i can edit this   (owner, chat 2026-10-13)

### [Q-056] notes · first lab notes you plan to write (titles only)
Context: suggestions from EXTRAS §4: SOC-lab detection rules with ATT&CK IDs, one HTB/THM write-up, the FedDecept
negative result. No notes = the section is hidden.
Options: titles | none yet
ANSWER: do whichever is best for recuriters and also remember through admin i can edit this   (owner, chat 2026-10-13)

### [Q-057] /security page text
Context: the page is written in Phase 12; you review it in that report.
Options: review at Phase 12
ANSWER: review at phase 12 and also remember through admin i can edit this   (owner, chat 2026-10-13)

## 12. Deploy (no secrets here; those are Phase 13)

### [Q-058] deploy · domain
Options: `<project>.vercel.app` (which project name?) | a custom domain (name)
ANSWER: i will say at the end   (owner, chat 2026-10-13)

### [Q-059] deploy · Vercel account ready? (2FA on?)
ANSWER: ready and i have to see   (owner, chat 2026-10-13)

### [Q-060] deploy · Upstash
Context: needed only for edit mode (Phases 8–9). It's added from the Vercel Marketplace in Phase 13.
Options: will add in Phase 13 | skip edit mode (Phases 8–9 dropped; content changes via commits)
ANSWER: do whichever is best remember that no dropping anything   (owner, chat 2026-10-13)

### [Q-061] deploy · GitHub repository for this site
Context: Phase 2.5 deploys via Vercel's GitHub import. You push; I never push.
Options: repo name (e.g. `sriman676/cosmos-v3`), public or private
ANSWER: I will say the name.   (owner, chat 2026-10-13)

---

# Round 2 — owner answers in chat, 2026-10-13 (verbatim), and how they were applied

- **Q-009:** "Still going, sarted in JUly ended at august, FnCyber started in AUgust" → SRM internship 2026-07 to
  2026-08; fnCyber from 2026-08, ongoing. fnCyber summary still open (Q-062).
- **Q-011/Q-012:** owner pasted AXON résumé lines: "Designed and implemented AXON, a post-quantum QUIC transport
  relocating provenance and capability enforcement from application metadata into the wire; measured 1.55% overhead
  versus 13× for per-frame signing across 130 tests in Rust with zero unsafe. Verified capability attenuation
  monotonicity over unbounded domains (SMT) and channel binding, non-forgeability and revocation ordering under an
  active Dolev-Yao adversary (Tamarin); retracted five claims that failed replication at corrected sample sizes."
  Skills list: Rust · QUIC · post-quantum cryptography (ML-KEM-768, ML-DSA-65, SLH-DSA) · formal verification
  (Tamarin, SMT-LIB2/Z3) · capability-based authorization (macaroons) · threat modeling · congestion control
  (BBR/Cubic) · fuzzing & timing side-channel analysis · performance benchmarking with statistical significance
  testing · protocol design → blurb and 8 skills from these lines; metrics kept private pending Q-063.
- **Q-021–Q-028:** "see the description for all 8 or you gave me description right use those which are in INtAKE.md"
  → status not inferred (SPEC §4.4); all 8 show the neutral "On GitHub" badge, settable in admin.
- **Q-029:** "Internship project, noone except me form SRM did this, it is done by different people pick best
  version" + two pasted blurb versions → 2-line version used as blurb; role "Internship project", your part open (Q-064).
- **Q-044:** "yes do it" → Languages & tools = Python, C++.
- **Q-046:** "you give something" · **Q-047:** "you decide" · **Q-048:** "keep them" → letter and yes-message drafted
  by Claude, editable in admin.
- **Q-055:** "you keep something" → left empty: "What I'd do differently" must be the owner's own reflection
  (EXTRAS §8); add in admin.
- **Q-008:** "yes" (internships and jobs) · admin scope: "Yes" (every section editable, SPEC §7) · photo: "I will go
  with your recommendation" (depth-map holographic avatar) · **Q-052:** "yes ok" · **Q-020:** "it is good" ·
  "1. to 4 OK 5 keep only relavent 6 to 12 ok" → certs: AI Skills Fest 2026 and MongoDB Associate Developer hidden
  (kept for admin).

### [Q-062] item: experience fnCyber · field: summary
Context: still required; 1–2 verb-first lines of what you do there (only what you may share).
Options: your lines | show title + dates only (no summary line)
ANSWER: SplitShield-XAI   (owner, chat 2026-10-13)

### [Q-063] item: axon · field: metricsPublic
Context: your résumé lines include "1.55% overhead versus 13× for per-frame signing across 130 tests". Public?
Options: yes (shown like FedDecept's) | no
ANSWER: yes   (owner, chat 2026-10-13)

### [Q-064] item: splitshield-xai · field: role
Context: "Internship project, no one except me from SRM did this, it is done by different people."
Options: your part in one line | "Internship project" only
ANSWER: Internship project   (owner, chat 2026-10-13)
