import type { Item } from "@/data/schema";
import type { Flagged, SiteContent } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { STATUS } from "@/lib/status";

/** Best public link for an item: its repo/code link, else its section on the profile page. */
export function itemUrl(item: Item, base: string): string {
  return item.links?.[0]?.url ?? `${base}/#${item.kind === "paper" ? "research" : "projects"}`;
}

function itemLines(items: Flagged<Item>[], base: string, full: boolean): string[] {
  return items.flatMap((i) => {
    const head = `- [${i.title}](${itemUrl(i, base)}): ${STATUS[i.status].label}. ${i.blurb}`;
    if (!full) return [head];
    const extra = [
      i.subtitle && `  - ${i.subtitle}`,
      i.role && `  - Role: ${i.role}`,
      i.skills.length > 0 && `  - Skills: ${i.skills.join(", ")}`,
      ...(i.metricsPublic && i.metrics ? i.metrics.map((m) => `  - ${m.label}: ${m.value}${m.note ? ` (${m.note})` : ""}`) : []),
      i.body && `  - ${i.body.replace(/\n+/g, " ")}`,
      i.retro && `  - What I'd do differently: ${i.retro}`,
    ];
    return [head, ...extra.filter((l): l is string => Boolean(l))];
  });
}

/** llmstxt.org-style Markdown profile (SPEC §9). `full` adds roles, skills, metrics and case-study text. */
export function profileMarkdown(c: SiteContent, base: string, full = false): string {
  const featured = c.projects.filter((p) => p.featured || full);
  const rest = full ? [] : c.projects.filter((p) => !p.featured);
  const sections: [string, string[]][] = [
    ["In short", c.tldr.map((l) => `- ${l}`)],
    ["Now", c.now.map((l) => `- ${l}`)],
    ["Experience", c.experience.map((e) => `- ${e.title}, ${e.org} (${formatRange(e.start, e.end)}): ${e.summary}`)],
    ["Research", itemLines(c.papers, base, full)],
    ["Projects", itemLines(featured, base, full)],
    ["Skills", c.skills.map((g) => `- ${g.group}: ${g.items.join(", ")}`)],
    ["Certifications", c.certs.map((cert) =>
      `- ${cert.verifyUrl ? `[${cert.title}](${cert.verifyUrl})` : cert.title}: ${cert.issuer} (${cert.status === "earned" ? "earned" : "in progress"})`)],
    ["Education", c.education.map((e) => `- ${e.degree}, ${e.school} (${e.start} – ${e.end})${e.showCgpa && e.cgpa ? `, CGPA ${e.cgpa}` : ""}`)],
    ["FAQ", c.faq.map((f) => `- **${f.q}** ${f.a}`)],
    ["Contact", [
      `- Email: ${c.links.email}`,
      `- [GitHub](${c.links.github})`,
      `- [LinkedIn](${c.links.linkedin})`,
      `- [ORCID](${c.links.orcid})`,
      ...(c.availability.open ? [`- Availability: ${c.availability.text}`] : []),
    ]],
    ["Optional", [
      ...itemLines(rest, base, false),
      full ? `- [Short profile](${base}/llms.txt)` : `- [Full profile](${base}/llms-full.txt): roles, skills, results and write-ups`,
      `- [Structured profile (JSON)](${base}/agents)`,
    ]],
  ];
  return [
    `# ${c.person.name}`,
    "",
    `> ${c.person.pitch}`,
    "",
    c.person.bio,
    "",
    `Location: ${c.person.location}. Updated: ${c.updatedAt}.`,
    ...sections.filter(([, lines]) => lines.length > 0).flatMap(([title, lines]) => ["", `## ${title}`, "", ...lines]),
    "",
  ].join("\n");
}

/** JSON-Resume-like profile for agents (SPEC §2 `/agents`). */
export function agentsProfile(c: SiteContent, base: string) {
  const item = (i: Flagged<Item>) => ({
    name: i.title,
    ...(i.subtitle && { subtitle: i.subtitle }),
    summary: i.blurb,
    status: STATUS[i.status].label,
    ...(i.role && { role: i.role }),
    keywords: i.skills,
    url: itemUrl(i, base),
    ...(i.metricsPublic && i.metrics && { results: i.metrics }),
  });
  return {
    $schema: "https://jsonresume.org/schema",
    basics: {
      name: c.person.name,
      label: c.person.pitch,
      summary: c.person.bio,
      email: c.links.email,
      url: `${base}/`,
      ...(c.person.photo && { image: `${base}${c.person.photo}` }),
      location: { address: c.person.location },
      profiles: [
        ...c.profiles.map((p) => ({ network: p.platform, username: p.handle, url: p.url })),
        { network: "LinkedIn", url: c.links.linkedin },
      ],
    },
    availability: c.availability.open ? c.availability.text : null,
    highlights: c.tldr,
    work: c.experience.map((e) => ({ name: e.org, position: e.title, startDate: e.start, ...(e.end && { endDate: e.end }), summary: e.summary })),
    education: c.education.map((e) => ({
      institution: e.school, studyType: e.degree, startDate: e.start, endDate: e.end, ...(e.showCgpa && e.cgpa && { score: e.cgpa }),
    })),
    publications: c.papers.map(item),
    projects: c.projects.map(item),
    certificates: c.certs.map((cert) => ({
      name: cert.title, issuer: cert.issuer, status: cert.status, ...(cert.verifyUrl && { url: cert.verifyUrl }),
    })),
    skills: c.skills.map((g) => ({ name: g.group, keywords: g.items })),
    meta: { lastModified: c.updatedAt, canonical: `${base}/agents`, llms: `${base}/llms.txt` },
  };
}
