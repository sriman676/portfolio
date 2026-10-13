// Cosmos v3 — SINGLE SOURCE OF TRUTH (copy to src/data/content.ts)
// Rules: never invent facts. Any required field containing "TODO(owner)" hides that item in production
// (SPEC §4.3). Lines marked VERIFY must be confirmed in docs/INTAKE.md. Repo URLs checked against
// github.com/sriman676 on 2026-10-12.

export type Status =
  | "published" | "under-review" | "in-preparation"   // papers
  | "shipped" | "in-progress" | "proposal"            // projects
  | "TODO(owner)";

export interface Metric { label: string; value: string; note?: string }

export interface Item {
  slug: string;                       // ^[a-z0-9-]{2,60}$
  kind: "paper" | "project";
  title: string;
  subtitle?: string;
  blurb: string;                      // ≤ 400 chars, one plain sentence or two
  status: Status;
  role?: string;                      // e.g. "Sole author", "First author", "Team of 5 — my part: …"
  skills: string[];                   // also drives the galaxy's skill lines (GALAXY §1)
  featured?: boolean;
  links?: { label: string; url: string }[];   // https only
  metricsPublic?: boolean;
  metrics?: Metric[];
  body?: string;                      // case-study Markdown subset (SECURITY.md §3.4)
  retro?: string;                     // "What I'd do differently" (owner-written; hidden if empty)
  source?: "seed" | "github" | "kv";
  repo?: string;                      // GitHub repo name → links this item to sync data (README, topics, pushed_at)
  hide?: boolean;                     // owner explicitly hides this item (satisfies the intake gate)
  draft?: boolean;                    // README-drafted text awaiting owner approval → never public
}

/** Display order. Edit mode writes overrides to KV; this is the seed default. */
export interface Ordering {
  preset: "manual" | "featured-first" | "recently-updated" | "most-stars";
  pinnedFirst: string[];              // slugs, in order
  pinnedLast: string[];               // slugs, in order
  manual: string[];                   // slugs, full manual order (used when preset = "manual")
}

export interface Content {
  person: {
    name: string; shortName: string; pitch: string; bio: string; location: string;
    photo?: string;                   // /public path; monogram until set
  };
  tldr: string[];                     // ≤ 3 proof lines under the hero (EXTRAS §5)
  now: string[];
  updatedAt: string;                  // YYYY-MM, for Now + Availability (EXTRAS §9)
  profiles: { platform: string; handle: string; url: string }[];  // verified public profiles (EXTRAS §11)
  experience: { org: string; title: string; start: string; end?: string; summary: string }[];
  education: { school: string; degree: string; start: string; end: string; cgpa?: string; showCgpa: boolean }[];
  items: Item[];
  certs: { title: string; issuer: string; status: "earned" | "in-progress"; verifyUrl?: string }[];
  skills: { group: string; items: string[] }[];
  links: { github: string; linkedin: string; email: string; orcid: string; resume?: string };
  faq: { q: string; a: string }[];
  hiddenRepos: string[];
  refs: string[];                     // whitelisted ?utm_source= values (EXTRAS §16)
  ordering: Ordering;
  heart: { letter: string; yesMessage: string; noLines: string[] };  // Teju mode (TEJU_MODE.md)
  availability: { open: boolean; text: string };                       // status line + whoami/neofetch
  terminal: { hireMessage: string; tourCaptions: { section: string; caption: string }[] };  // TERMINAL.md
}

const GH = "https://github.com/sriman676";

export const content: Content = {
  person: {
    name: "Sriman Rutvik Voddiraju",
    shortName: "Sriman",
    pitch: "Cybersecurity researcher and builder: SOC operations, detection engineering, and applied AI for security.",
    // TODO(owner): rewrite in your own voice (2–3 sentences). Draft built only from facts you've stated:
    bio: "I'm a B.Tech CSE (Cybersecurity) student at SRM University AP. I work on identity-centric security, federated learning for cyber deception, and guardrails for AI agents. I run a home SOC lab and build detection rules mapped to MITRE ATT&CK.",
    location: "Hyderabad, India",
    photo: undefined, // TODO(owner): /profile.jpg
  },

  tldr: [
    "TODO(owner): approve or edit → e.g. Two security papers under review (HIDRA, FedDecept).",
    "TODO(owner): approve or edit → e.g. Cyber Security Intern at fnCyber.",
    "TODO(owner): approve or edit → e.g. N open-source security projects on GitHub.",
  ],

  updatedAt: "2026-10",

  profiles: [
    { platform: "GitHub", handle: "sriman676", url: GH },
    { platform: "ORCID", handle: "0009-0002-0532-6168", url: "https://orcid.org/0009-0002-0532-6168" },
    { platform: "TryHackMe", handle: "TODO(owner)", url: "TODO(owner)" },
    { platform: "HTB Academy", handle: "TODO(owner)", url: "TODO(owner)" },
  ],

  now: [
    "Cyber Security Intern at fnCyber (since July 2026).",
    "Two papers under review: HIDRA (sole author) and FedDecept (first author).",
    "Preparing for AWS Certified Cloud Practitioner.",
  ],

  experience: [
    {
      org: "fnCyber", title: "Cyber Security Intern", start: "2026-07",
      summary: "TODO(owner): 1–2 lines on what you do there (only what you're allowed to share).",
    },
    {
      org: "SRM University AP", title: "Summer Research Intern", start: "2026-06", end: "2026-08",
      summary: "Built FedDecept, privacy-preserving federated coordination of cyber-deception strategy, under Dr. Satish Anamalamudi.",
    },
  ],

  education: [
    {
      school: "SRM University AP", degree: "B.Tech Computer Science & Engineering (Cybersecurity)",
      start: "2024", end: "2028",
      cgpa: "TODO(owner): exact CGPA", showCgpa: false, // set true only after filling the exact value
    },
  ],

  items: [
    // ── Papers ──────────────────────────────────────────────────────────────
    {
      slug: "hidra", kind: "paper", featured: true,
      title: "HIDRA", subtitle: "Hybrid Identity Detection and Risk Architecture",
      blurb: "Models the attack surface as a Temporal Attack-Surface Graph with eight node types and treats non-human identities as first-class security objects.",
      status: "under-review", role: "Sole author",
      skills: ["identity security", "graph models", "threat detection", "non-human identities"],
      // metrics exist (3 theorems; 500-node / 520-event scenario; 24–120 s latency) but NOT approved for public yet
      metricsPublic: false,
    },
    {
      slug: "feddecept", kind: "paper", featured: true,
      title: "FedDecept", subtitle: "Privacy-preserving federated coordination of cyber-deception strategy",
      blurb: "Lets organisations coordinate honeypot and deception strategy through federated learning without sharing raw data, with Byzantine-robust aggregation that holds under poisoning.",
      status: "under-review",
      role: "First author, with Lakshmi Rishitha Dintakurthi and Naga Sravya Nanduru; supervised by Dr. Satish Anamalamudi", // VERIFY co-authors are OK being named
      skills: ["federated learning", "cyber deception", "honeypots", "robust aggregation", "Python", "Flower"],
      links: [{ label: "Code (MIT)", url: `${GH}/FedDecept` }], repo: "FedDecept",
      metricsPublic: true, // approved by owner
      metrics: [
        { label: "Effect size", value: "Cohen's d = 2.86", note: "8-seed evaluation" },
        { label: "vs isolated operation", value: "≈ 48% improvement" },
        { label: "Centralized oracle gain recovered", value: "≈ 79%" },
        { label: "Under poisoning", value: "Coordinate-wise median holds where FedAvg collapses" },
      ],
      body: "TODO(owner): optional longer write-up. One honest detail worth keeping: a self-tuning aggregator was cut after it showed no measurable benefit, and the negative result is documented.",
    },
    {
      slug: "axon", kind: "paper",
      title: "AXON", blurb: "TODO(owner): one-line summary + venue type (journal).",
      status: "under-review", skills: ["TODO(owner)"],
    },
    {
      slug: "sigma", kind: "paper",
      title: "SIGMA", subtitle: "Semantic Intent Governance for Multi-Agent Authorization",
      blurb: "A formal framework for authorizing multi-agent AI actions by semantic intent, with a working Python scaffold and microbenchmarks.",
      status: "TODO(owner)", // under review / in preparation?
      skills: ["agentic security", "authorization", "multi-agent systems", "Python"],
    },
    {
      slug: "aria", kind: "paper",
      title: "ARIA", subtitle: "Agentic Runtime Intent Architecture", // VERIFY expansion
      blurb: "TODO(owner): one-line summary.", status: "TODO(owner)", skills: ["agentic security"],
    },
    {
      slug: "imap", kind: "paper",
      title: "IMAP", subtitle: "Bio-inspired authentication", // VERIFY
      blurb: "TODO(owner): one-line summary.", status: "TODO(owner)", skills: ["authentication", "bio-inspired computing"],
    },
    {
      slug: "unquestioned-rumor", kind: "paper",
      title: "The Unquestioned Rumor", subtitle: "A conceptual psychology paper on why gossip persists",
      blurb: "A sole-author conceptual paper on the persistence of unverified rumours.",
      status: "in-preparation", role: "Sole author", skills: ["psychology", "misinformation"],
      // TODO(owner): keep on a security portfolio? Delete this item if not.
    },

    // ── Projects ────────────────────────────────────────────────────────────
    // Status for public repos is TODO until you confirm "shipped" vs "in-progress".
    {
      slug: "soc-agentlab", kind: "project", featured: true,
      title: "soc-agentlab", blurb: "An OpenEnv-style reinforcement-learning environment for training SOC alert-triage agents, built at the Meta PyTorch Hackathon × Scaler.",
      status: "TODO(owner)", skills: ["SOC operations", "reinforcement learning", "AI agents", "Python"],
      links: [{ label: "GitHub", url: `${GH}/SOC` }], repo: "SOC",
    },
    {
      slug: "gardrail", kind: "project", featured: true,
      title: "GardRail", blurb: "FastAPI middleware that blocks prompt-injection attacks on AI agents and detects behavioural drift.",
      status: "TODO(owner)", skills: ["AI security", "prompt injection", "AI agents", "FastAPI", "Python"],
      links: [{ label: "GitHub", url: `${GH}/GardRail` }], repo: "GardRail",
    },
    {
      slug: "aegis", kind: "project", featured: true,
      title: "AEGIS", blurb: "A zero-trust kernel in Rust and Python that governs autonomous AI coding agents, with a React dashboard.",
      status: "TODO(owner)", skills: ["agentic security", "zero trust", "AI agents", "Rust", "Python", "React"],
      links: [{ label: "GitHub", url: `${GH}/AEGIS` }], repo: "AEGIS",
    },
    {
      slug: "splitshield-xai", kind: "project", featured: true,
      title: "SplitShield-XAI", blurb: "Split-learning intrusion detection with privacy, explainability and adversarial robustness. Design and implementation complete; training and validation pending.",
      status: "in-progress", role: "Team of 5 (SRM University AP). TODO(owner): your part",
      skills: ["intrusion detection", "split learning", "federated learning", "explainable AI", "Python"],
      // no metrics until experiments run
    },
    {
      slug: "home-soc-lab", kind: "project",
      title: "Home SOC Lab", blurb: "Splunk and Wazuh monitoring a Windows/Linux victim network, with detection rules mapped to MITRE ATT&CK.",
      status: "in-progress", skills: ["SOC operations", "detection engineering", "Splunk", "Wazuh", "MITRE ATT&CK"],
    },
    {
      slug: "nexus", kind: "project",
      title: "NEXUS", blurb: "Identity-centric cyber resilience for critical infrastructure.",
      status: "TODO(owner)", skills: ["identity security", "critical infrastructure"],
      links: [{ label: "GitHub", url: `${GH}/NEXUS` }], repo: "NEXUS",
    },
    {
      slug: "soc-automation", kind: "project",
      title: "SOC_Automation", blurb: "Correlates Windows 4624/4625 logon events into explainable alerts.",
      status: "TODO(owner)", skills: ["SOC operations", "detection engineering", "Windows logs", "Python"],
      links: [{ label: "GitHub", url: `${GH}/SOC_Automation` }], repo: "SOC_Automation",
    },
    {
      slug: "threattrap", kind: "project",
      title: "ThreatTrap", blurb: "An adaptive honeypot platform, proposed to the OWASP Foundation.",
      status: "proposal", skills: ["honeypots", "cyber deception"],
    },
    {
      slug: "meshwork", kind: "project",
      title: "meshwork", blurb: "A P2P compute mesh in Go with microVM isolation.",
      status: "TODO(owner)", skills: ["Go", "distributed systems", "isolation"],
      links: [{ label: "GitHub", url: `${GH}/meshwork` }], repo: "meshwork",
    },
    {
      slug: "vishu", kind: "project",
      title: "Vishu", blurb: "A local-first TypeScript assistant with an MCP gateway.",
      status: "TODO(owner)", skills: ["AI agents", "MCP", "TypeScript"],
      links: [{ label: "GitHub", url: `${GH}/Vishu` }], repo: "Vishu",
    },
    {
      slug: "bruteforce-sim", kind: "project",
      title: "Adaptive Brute-Force Attack Mitigation Simulator", blurb: "A C++ simulator for adaptive brute-force mitigation strategies.",
      status: "TODO(owner)", skills: ["C++", "authentication", "attack simulation"],
      links: [{ label: "GitHub", url: `${GH}/Adaptive-Brute-Force-Attack-Mitigation-Simulator` }], repo: "Adaptive-Brute-Force-Attack-Mitigation-Simulator",
    },
  ],

  certs: [
    { title: "Google Cybersecurity Professional Certificate (v2)", issuer: "Google", status: "earned", verifyUrl: undefined }, // TODO(owner): Credly/Coursera link
    { title: "Introduction to Cybersecurity", issuer: "TODO(owner)", status: "earned" },
    { title: "Cyber Job Simulation", issuer: "Deloitte Australia", status: "earned" },          // TODO(owner): platform + link
    { title: "AI+ Skills Fest 2026", issuer: "TODO(owner)", status: "earned" },
    { title: "PCAP Analysis", issuer: "TODO(owner)", status: "earned" },
    { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", status: "in-progress" },
  ],

  skills: [
    { group: "Security operations", items: ["SOC operations", "Detection engineering", "Splunk", "Wazuh", "MITRE ATT&CK", "Log correlation"] },
    { group: "AI security & ML", items: ["Agentic security", "Prompt-injection defence", "Federated learning", "Split learning", "Explainable AI"] },
    { group: "Languages & tools", items: ["Python", "TypeScript", "Rust", "Go", "C++", "FastAPI", "React", "Flower"] },
    // TODO(owner): add/remove; keep only what you can defend in an interview
  ],

  links: {
    github: GH,
    linkedin: "https://www.linkedin.com/in/sriman-rutvik",
    email: "srimanrutvik28@gmail.com",
    orcid: "https://orcid.org/0009-0002-0532-6168",
    resume: undefined, // set "/resume.pdf" after adding the file
  },

  faq: [
    { q: "Who is Sriman Rutvik Voddiraju?", a: "A cybersecurity researcher and builder studying B.Tech CSE (Cybersecurity) at SRM University AP, focused on SOC operations, detection engineering, and applied AI for security." },
    { q: "What is HIDRA?", a: "A security architecture that models the attack surface as a temporal graph and treats non-human identities, like service accounts and AI agents, as first-class security objects. The paper is under review." },
    { q: "What is FedDecept?", a: "A federated-learning approach that lets organisations coordinate cyber-deception strategy without sharing raw data. The paper is under review and the code is open source under MIT." },
    { q: "What roles is he looking for?", a: "TODO(owner): e.g. internships / roles in SOC, detection engineering, and AI security — remote-friendly." },
  ],

  // Every other public repo auto-syncs (SPEC §4.4). These two are not projects:
  hiddenRepos: ["sriman676", "portfolio-main"],

  refs: ["linkedin", "resume", "resume-qr", "email", "github", "cover-letter", "referral"],

  ordering: {
    preset: "featured-first",
    pinnedFirst: ["hidra", "feddecept"],   // TODO(owner): confirm in INTAKE.md (or rearrange later in edit mode)
    pinnedLast: [],
    manual: [],
  },

  availability: { open: true, text: "TODO(owner): e.g. Open to SOC / AI-security internships (remote-friendly)" },

  terminal: {
    hireMessage: "TODO(owner): short line shown after `sudo hire-sriman`, e.g. what you're looking for + best way to reach you.",
    tourCaptions: [
      { section: "hero", caption: "TODO(owner)" },
      { section: "now", caption: "TODO(owner)" },
      { section: "projects", caption: "TODO(owner)" },
      { section: "research", caption: "TODO(owner)" },
      { section: "contact", caption: "TODO(owner)" },
    ],
  },

  heart: {
    letter: "TODO(owner): your love letter. Remember: anyone who types the trigger will see this.",
    yesMessage: "TODO(owner): message shown after she says yes.",
    noLines: ["Are you sure?", "Really sure?", "Think again 🥺", "Last chance…", "Okay, this one's a Yes too ❤️"],
  },
};
