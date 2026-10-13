// Content schema (SPEC §4.1, SECURITY.md §3.4). The build fails if content.ts doesn't match it.
import { z } from "zod";

/** https only, parsed with URL, no credentials (SECURITY.md §3.4). */
export const httpsUrl = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}, "must be an https URL without credentials");

// same-origin path only: no protocol-relative "//host" and no ".." segments
const sitePath = z.string().regex(/^\/(?!\/)(?!.*\.\.)[\w./-]*$/, "must be a site path like /avatar.jpg");
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be YYYY-MM");
const text = (max: number) => z.string().trim().min(1).max(max);
const slug = z.string().regex(/^[a-z0-9-]{2,60}$/);

export const Status = z.enum([
  "published", "under-review", "in-preparation",
  "shipped", "in-progress", "proposal",
  "on-github",
  "TODO(owner)",
]);

export const Metric = z.strictObject({ label: text(60), value: text(80), note: text(120).optional() });

export const Item = z.strictObject({
  slug,
  kind: z.enum(["paper", "project"]),
  title: text(120),
  subtitle: text(160).optional(),
  blurb: text(400),
  status: Status,
  role: text(200).optional(),
  skills: z.array(text(60)).max(20),
  featured: z.boolean().optional(),
  links: z.array(z.strictObject({ label: text(40), url: httpsUrl })).max(6).optional(),
  metricsPublic: z.boolean().optional(),
  metrics: z.array(Metric).max(8).optional(),
  body: text(8000).optional(),
  retro: text(1000).optional(),
  source: z.enum(["seed", "github", "kv"]).optional(),
  repo: text(100).optional(),
  hide: z.boolean().optional(),
  draft: z.boolean().optional(),
});

export const Ordering = z.strictObject({
  preset: z.enum(["manual", "featured-first", "recently-updated", "most-stars"]),
  pinnedFirst: z.array(slug).max(200),
  pinnedLast: z.array(slug).max(200),
  manual: z.array(slug).max(200),
});

export const Content = z.strictObject({
  person: z.strictObject({
    name: text(80), shortName: text(40), pitch: text(200), bio: text(600), location: text(80),
    photo: sitePath.optional(),
  }),
  tldr: z.array(text(160)).max(3),
  now: z.array(text(200)).max(6),
  updatedAt: yearMonth,
  profiles: z.array(z.strictObject({ platform: text(40), handle: text(80), url: httpsUrl })).max(8),
  experience: z.array(z.strictObject({
    org: text(80), title: text(80),
    start: yearMonth, end: yearMonth.optional(),
    summary: text(400),
  })),
  education: z.array(z.strictObject({
    school: text(120), degree: text(160), start: text(10), end: text(10),
    cgpa: text(40).optional(), showCgpa: z.boolean(),
  })),
  items: z.array(Item),
  certs: z.array(z.strictObject({
    title: text(160), issuer: text(120), status: z.enum(["earned", "in-progress"]),
    verifyUrl: httpsUrl.optional(), hide: z.boolean().optional(),
  })),
  skills: z.array(z.strictObject({ group: text(60), items: z.array(text(60)).max(30) })),
  links: z.strictObject({
    github: httpsUrl, linkedin: httpsUrl, email: z.email(), orcid: httpsUrl, resume: sitePath.optional(),
  }),
  faq: z.array(z.strictObject({ q: text(200), a: text(800) })),
  hiddenRepos: z.array(text(100)),
  refs: z.array(z.string().regex(/^[a-z0-9-]{1,30}$/)),
  ordering: Ordering,
  heart: z.strictObject({ letter: text(4000), yesMessage: text(400), noLines: z.array(text(80)).min(1).max(10) }),
  availability: z.strictObject({ open: z.boolean(), text: text(160) }),
  terminal: z.strictObject({
    hireMessage: text(300),
    tourCaptions: z.array(z.strictObject({ section: text(40), caption: text(160) })).max(10),
  }),
});

export type Status = z.infer<typeof Status>;
export type Metric = z.infer<typeof Metric>;
export type Item = z.infer<typeof Item>;
export type Ordering = z.infer<typeof Ordering>;
export type Content = z.infer<typeof Content>;
