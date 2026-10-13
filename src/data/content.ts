// Cosmos v3 — SINGLE SOURCE OF TRUTH (created from seed/content.seed.ts in Phase 0.5).
// Rules: never invent facts. Owner-pending markers hide an item in production (SPEC §4.3); every open marker
// is a question in docs/INTAKE.md and is resolved only by the owner. Repo URLs checked against
// github.com/sriman676 on 2026-10-12. Intake answers applied 2026-10-13 (docs/INTAKE.md).

import type { Content } from "./schema";

const GH = "https://github.com/sriman676";

export const content: Content = {
  person: {
    name: "Sriman Rutvik Voddiraju",
    shortName: "Sriman",
    pitch: "Cybersecurity researcher and builder: SOC operations, detection engineering, and applied AI for security.",
    bio: "Hi fellows, Sriman here. I'm a B.Tech CSE (Cybersecurity) student at SRM University AP working on identity-centric security, federated learning for cyber deception, and guardrails for AI agents. I run a home SOC lab and build detection rules mapped to MITRE ATT&CK.",
    location: "Hyderabad, India",
    photo: "/avatar.jpg", // from the owner's avatar; EXIF stripped when added to /public (Phase 1)
  },

  tldr: [
    "Three papers under review: HIDRA (sole author), FedDecept (first author) and AXON.",
    "Cyber Security Intern at fnCyber.",
    "16 public projects on GitHub.",
  ],

  updatedAt: "2026-10",

  profiles: [
    { platform: "GitHub", handle: "sriman676", url: GH },
    { platform: "ORCID", handle: "0009-0002-0532-6168", url: "https://orcid.org/0009-0002-0532-6168" },
  ],

  now: [
    "Cyber Security Intern at fnCyber (since August 2026).",
    "Three papers under review: HIDRA (sole author), FedDecept (first author) and AXON.",
    "Preparing for AWS Certified Cloud Practitioner.",
  ],

  experience: [
    {
      org: "fnCyber", title: "Cyber Security Intern", start: "2026-08",
      summary: "Working on SplitShield-XAI: measuring how the cut-layer depth in split-learning intrusion detection trades off detection performance, private-feature leakage, client compute cost and SHAP explanation stability.",
    },
    {
      org: "SRM University AP", title: "Summer Research Intern", start: "2026-07", end: "2026-08",
      summary: "Built FedDecept, privacy-preserving federated coordination of cyber-deception strategy, under Dr. Satish Anamalamudi.",
    },
  ],

  education: [
    {
      school: "SRM University AP", degree: "B.Tech Computer Science & Engineering (Cybersecurity)",
      start: "2024", end: "2028",
      cgpa: "8.35", showCgpa: true,
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
      role: "First author, with Lakshmi Rishitha Dintakurthi and Naga Sravya Nanduru; supervised by Dr. Satish Anamalamudi",
      skills: ["federated learning", "cyber deception", "honeypots", "robust aggregation", "Python", "Flower"],
      links: [{ label: "Code (MIT)", url: `${GH}/FedDecept` }], repo: "FedDecept",
      metricsPublic: true, // approved by owner
      metrics: [
        { label: "Effect size", value: "Cohen's d = 2.86", note: "8-seed evaluation" },
        { label: "vs isolated operation", value: "≈ 48% improvement" },
        { label: "Centralized oracle gain recovered", value: "≈ 79%" },
        { label: "Under poisoning", value: "Coordinate-wise median holds where FedAvg collapses" },
      ],
      body: "A self-tuning aggregator was cut after it showed no measurable benefit, and the negative result is documented.",
    },
    {
      slug: "axon", kind: "paper",
      title: "AXON", subtitle: "Post-quantum QUIC transport",
      blurb: "A post-quantum QUIC transport that moves provenance and capability enforcement from application metadata into the wire, with capability attenuation verified in SMT and channel binding, non-forgeability and revocation ordering verified in Tamarin. Under review at a journal.",
      status: "under-review",
      skills: ["Rust", "QUIC", "post-quantum cryptography", "formal verification", "Tamarin", "capability-based authorization", "protocol design", "threat modeling"],
      metricsPublic: true, // approved by owner (INTAKE Q-063)
      metrics: [
        { label: "Transport overhead", value: "1.55%", note: "vs 13× for per-frame signing, across 130 tests" },
        { label: "Implementation", value: "Rust, zero unsafe" },
      ],
    },
    {
      slug: "unquestioned-rumor", kind: "paper",
      title: "The Unquestioned Rumor", subtitle: "A conceptual psychology paper on why gossip persists",
      blurb: "A sole-author conceptual paper on the persistence of unverified rumours.",
      status: "in-preparation", role: "Sole author", skills: ["psychology", "misinformation"],
    },

    // ── Projects ────────────────────────────────────────────────────────────
    {
      slug: "soc-agentlab", kind: "project", featured: true,
      title: "soc-agentlab", blurb: "An OpenEnv-style reinforcement-learning environment for training SOC alert-triage agents, built at the Meta PyTorch Hackathon × Scaler.",
      status: "on-github", skills: ["SOC operations", "reinforcement learning", "AI agents", "Python"],
      links: [{ label: "GitHub", url: `${GH}/SOC` }], repo: "SOC",
    },
    {
      slug: "gardrail", kind: "project", featured: true,
      title: "GardRail", blurb: "FastAPI middleware that blocks prompt-injection attacks on AI agents and detects behavioural drift.",
      status: "on-github", skills: ["AI security", "prompt injection", "AI agents", "FastAPI", "Python"],
      links: [{ label: "GitHub", url: `${GH}/GardRail` }], repo: "GardRail",
    },
    {
      slug: "aegis", kind: "project", featured: true,
      title: "AEGIS", blurb: "A zero-trust kernel in Rust and Python that governs autonomous AI coding agents, with a React dashboard.",
      status: "on-github", skills: ["agentic security", "zero trust", "AI agents", "Rust", "Python", "React"],
      links: [{ label: "GitHub", url: `${GH}/AEGIS` }], repo: "AEGIS",
    },
    {
      slug: "splitshield-xai", kind: "project", featured: true,
      title: "SplitShield-XAI", blurb: "Measures how the depth of the cut layer in split-learning intrusion detection trades off detection performance, private-feature leakage, client compute cost and SHAP explanation stability. Built on a corrected CIC-IDS2017 with multi-seed evaluation, a control for every metric and pre-registered hypotheses.",
      status: "in-progress", role: "Internship project",
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
      status: "on-github", skills: ["identity security", "critical infrastructure"],
      links: [{ label: "GitHub", url: `${GH}/NEXUS` }], repo: "NEXUS",
    },
    {
      slug: "soc-automation", kind: "project",
      title: "SOC_Automation", blurb: "Correlates Windows 4624/4625 logon events into explainable alerts.",
      status: "on-github", skills: ["SOC operations", "detection engineering", "Windows logs", "Python"],
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
      status: "on-github", skills: ["Go", "distributed systems", "isolation"],
      links: [{ label: "GitHub", url: `${GH}/meshwork` }], repo: "meshwork",
    },
    {
      slug: "vishu", kind: "project",
      title: "Vishu", blurb: "A local-first TypeScript assistant with an MCP gateway.",
      status: "on-github", skills: ["AI agents", "MCP", "TypeScript"],
      links: [{ label: "GitHub", url: `${GH}/Vishu` }], repo: "Vishu",
    },
    {
      slug: "bruteforce-sim", kind: "project",
      title: "Adaptive Brute-Force Attack Mitigation Simulator", blurb: "A C++ simulator for adaptive brute-force mitigation strategies.",
      status: "on-github", skills: ["C++", "authentication", "attack simulation"],
      links: [{ label: "GitHub", url: `${GH}/Adaptive-Brute-Force-Attack-Mitigation-Simulator` }], repo: "Adaptive-Brute-Force-Attack-Mitigation-Simulator",
    },

    // ── GitHub-only repos (INTAKE Q-030–Q-036): kept, pinned last, README-based blurbs ──
    {
      slug: "ai-image-caption-generator", kind: "project", source: "github",
      title: "AI Image Caption Generator", blurb: "Python tool that captions images using a CNN encoder (MobileNetV2 features) and an LSTM decoder.",
      status: "on-github", skills: ["Python"],
      links: [{ label: "GitHub", url: `${GH}/AI-image-caption-generator` }], repo: "AI-image-caption-generator",
    },
    {
      slug: "anganwadi-ai", kind: "project", source: "github",
      title: "Anganwadi AI Companion", blurb: "AI-powered mobile app that helps India's Anganwadi frontline workers manage child nutrition and care. Built for the Wadhwani AI Hackathon 2024 (Early Childhood track).",
      status: "on-github", skills: ["TypeScript"],
      links: [{ label: "GitHub", url: `${GH}/Anganwadi-ai` }], repo: "Anganwadi-ai",
    },
    {
      slug: "appointment-system", kind: "project", source: "github",
      title: "Appointment System", blurb: "Full-stack MERN appointment booking and management platform with role-based access for students, counselors and admins, real-time notifications and analytics dashboards.",
      status: "on-github", skills: ["JavaScript"],
      links: [{ label: "GitHub", url: `${GH}/Appointment-System` }], repo: "Appointment-System",
    },
    {
      slug: "eco-optimizer", kind: "project", source: "github",
      title: "EcoOptimizer", blurb: "Sustainability planning dashboard that uses a greedy priority-weighted algorithm to recommend the most cost-effective environmental actions across five domains, with AI-written explanations (Next.js + FastAPI).",
      status: "on-github", skills: ["TypeScript"],
      links: [{ label: "GitHub", url: `${GH}/eco_optimizer` }], repo: "eco_optimizer",
    },
    {
      slug: "farmers-app", kind: "project", source: "github",
      title: "Farmers_app", blurb: "Flask-based farm-to-consumer marketplace where verified farmers list produce directly to buyers, with role-based auth (buyer/farmer/admin), farmer ID-proof verification, and an admin approval dashboard.",
      status: "on-github", skills: ["HTML"],
      links: [{ label: "GitHub", url: `${GH}/Farmers_app` }], repo: "Farmers_app",
    },
    {
      slug: "humanizer", kind: "project", source: "github",
      title: "Humanizer", blurb: "Local-first Python tool that rewrites long-form text through a three-stage pipeline (two local Ollama LLM passes, then Python post-processing), with a CLI and a Flask web UI.",
      status: "on-github", skills: ["Python"],
      links: [{ label: "GitHub", url: `${GH}/humanizer` }], repo: "humanizer",
    },
    {
      slug: "trustnet", kind: "project", source: "github",
      title: "TrustNet", blurb: "Decentralized scam-intelligence platform with Solidity smart contracts for on-chain reporting and verification, a Next.js frontend, AI-assisted message analysis and IPFS evidence storage.",
      status: "on-github", skills: ["JavaScript"],
      links: [{ label: "GitHub", url: `${GH}/trustnet` }], repo: "trustnet",
    },
  ],

  // Titles and issuers as shown on each verify page (checked 2026-10-13). Hidden = kept for admin, not shown.
  certs: [
    { title: "Google Cybersecurity Professional Certificate (v2)", issuer: "Google (via Coursera)", status: "earned", verifyUrl: "https://www.credly.com/badges/cb352130-5a8a-4393-8d06-ba9e379cc621/linked_in_profile" },
    { title: "Introduction to Cybersecurity", issuer: "Cisco", status: "earned", verifyUrl: "https://www.credly.com/badges/12a7135e-2d4a-4f6f-abc3-385854591451/linked_in_profile" },
    { title: "Cyber Job Simulation", issuer: "Deloitte Australia (via Forage)", status: "earned", verifyUrl: "https://www.theforage.com/completion-certificates/9PBTqmSxAf6zZTseP/E9pA6qsdbeyEkp3ti_9PBTqmSxAf6zZTseP_69d3af169ac693e04087bf8b_1775481805360_completion_certificate.pdf" },
    { title: "PCAP Analysis", issuer: "LetsDefend", status: "earned", verifyUrl: "https://app.letsdefend.io/my-rewards/detail/fda04217-86b4-4925-9f8c-9673e8e03a71" },
    { title: "SOC Member", issuer: "LetsDefend", status: "earned", verifyUrl: "https://app.letsdefend.io/my-rewards/detail/ceffef63-5b6d-4856-973e-3fb610d39f7f" },
    { title: "Red Hat System Administration I (RH124 - RHA) - Ver. 10", issuer: "Red Hat", status: "earned", verifyUrl: "https://www.credly.com/badges/d3c53686-d9c6-4998-9315-c5c9682994f7/linked_in_profile" },
    { title: "AI Capabilities and Limitations", issuer: "Anthropic", status: "earned", verifyUrl: "https://verify.skilljar.com/c/uirgunibrawt" },
    { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", status: "in-progress" },
    { title: "AI Skills Fest 2026", issuer: "Microsoft", status: "earned", verifyUrl: "https://www.credly.com/badges/c2aeeb6e-6676-47d3-b33d-d07a576a4243/linked_in_profile", hide: true },
    { title: "MongoDB Associate Developer", issuer: "MongoDB", status: "earned", verifyUrl: "https://www.credly.com/badges/5cd4c5b0-75f4-477e-8e8d-05a3b71a1668/linked_in_profile", hide: true },
  ],

  skills: [
    { group: "Security operations", items: ["SOC operations", "Detection engineering", "Splunk", "Wazuh", "MITRE ATT&CK", "Log correlation"] },
    { group: "AI security & ML", items: ["Agentic security", "Prompt-injection defence", "Federated learning", "Split learning", "Explainable AI"] },
    { group: "Languages & tools", items: ["Python", "C++"] },
  ],

  links: {
    github: GH,
    linkedin: "https://www.linkedin.com/in/sriman-rutvik",
    email: "srimanrutvik28@gmail.com",
    orcid: "https://orcid.org/0009-0002-0532-6168",
    resume: undefined, // owner provides the file at the end (INTAKE Q-007)
  },

  faq: [
    { q: "Who is Sriman Rutvik Voddiraju?", a: "A cybersecurity researcher and builder studying B.Tech CSE (Cybersecurity) at SRM University AP, focused on SOC operations, detection engineering, and applied AI for security." },
    { q: "What is HIDRA?", a: "A security architecture that models the attack surface as a temporal graph and treats non-human identities, like service accounts and AI agents, as first-class security objects. The paper is under review." },
    { q: "What is FedDecept?", a: "A federated-learning approach that lets organisations coordinate cyber-deception strategy without sharing raw data. The paper is under review and the code is open source under MIT." },
    { q: "What roles is he looking for?", a: "Internships and jobs in SOC, AI, agentic AI and AI security." },
  ],

  // Every other public repo auto-syncs (SPEC §4.4). These two are not projects:
  hiddenRepos: ["sriman676", "portfolio-main"],

  refs: ["linkedin", "resume", "resume-qr", "email", "github", "cover-letter", "referral"],

  ordering: {
    preset: "featured-first",
    pinnedFirst: ["hidra", "feddecept"],
    pinnedLast: ["ai-image-caption-generator", "anganwadi-ai", "appointment-system", "eco-optimizer", "farmers-app", "humanizer", "trustnet"],
    manual: [],
  },

  availability: { open: true, text: "Open to SOC, AI, agentic AI and AI-security internships and jobs" },

  terminal: {
    hireMessage: "Looking for SOC, AI, agentic AI and AI-security internships and jobs. Fastest way to reach me: srimanrutvik28@gmail.com.",
    tourCaptions: [
      { section: "hero", caption: "Start here: who I am, in one line." },
      { section: "now", caption: "What I'm working on right now." },
      { section: "projects", caption: "What I've built. Each planet opens a case study." },
      { section: "research", caption: "Papers, each with its honest status." },
      { section: "contact", caption: "Pick a channel. I reply fast." },
    ],
  },

  // Owner asked Claude to draft these (INTAKE Q-046/Q-047); editable in admin. Public to anyone who finds the trigger.
  heart: {
    letter: "I built a whole galaxy for this site, and somewhere along the way I realised the brightest thing in it isn't on any map. It's you. You make the hard days lighter and the good days better, and you make me want to be someone worth standing next to. Every star here keeps to its own orbit, but mine keeps finding its way back to you. So I hid this little corner of the universe just for you, because there's one question I've been wanting to ask.",
    yesMessage: "You just made this whole galaxy shine brighter. I love you. ❤️",
    noLines: ["Are you sure?", "Really sure?", "Think again 🥺", "Last chance…", "Okay, this one's a Yes too ❤️"],
  },
};
