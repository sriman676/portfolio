import { content as seed } from "@/data/content";
import { Content, type Item, type Ordering } from "@/data/schema";
import { mergeContent } from "@/lib/merge";

const PLACEHOLDER = "TODO(owner)";

/** Marks an entry shown only in development because the owner still has to fill it. */
export type Flagged<T> = T & { needsOwner?: true };

/** True when any string anywhere in the value carries the owner placeholder. */
export function hasPlaceholder(value: unknown): boolean {
  if (typeof value === "string") return value.includes(PLACEHOLDER);
  if (Array.isArray(value)) return value.some(hasPlaceholder);
  if (value && typeof value === "object") return Object.values(value).some(hasPlaceholder);
  return false;
}

/** SPEC §4.3: hidden and draft entries never render; placeholder entries render only in dev, flagged. */
export function visible<T extends object>(list: T[], dev = process.env.NODE_ENV === "development"): Flagged<T>[] {
  return list.flatMap((entry) => {
    const { hide, draft } = entry as { hide?: boolean; draft?: boolean };
    if (hide || draft) return [];
    if (!hasPlaceholder(entry)) return [entry];
    return dev ? [{ ...entry, needsOwner: true as const }] : [];
  });
}

/**
 * SPEC §4.5: pinnedFirst, then the preset, then pinnedLast; ties keep seed order.
 * shortcut: "recently-updated" and "most-stars" keep seed order until GitHub data exists (Phase 10).
 */
export function orderItems<T extends Pick<Item, "slug" | "featured">>(items: T[], ordering: Ordering): T[] {
  const at = (list: string[], slug: string) => {
    const i = list.indexOf(slug);
    return i === -1 ? list.length : i;
  };
  const band = (slug: string) => (ordering.pinnedFirst.includes(slug) ? 0 : ordering.pinnedLast.includes(slug) ? 2 : 1);
  const within = (it: T) => {
    const b = band(it.slug);
    if (b === 0) return at(ordering.pinnedFirst, it.slug);
    if (b === 2) return at(ordering.pinnedLast, it.slug);
    if (ordering.preset === "manual") return at(ordering.manual, it.slug);
    return ordering.preset === "featured-first" && !it.featured ? 1 : 0;
  };
  return items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => band(a.it.slug) - band(b.it.slug) || within(a.it) - within(b.it) || a.i - b.i)
    .map(({ it }) => it);
}

/** Validated, filtered, ordered content for rendering. Seed only until GitHub (Phase 10) and KV (Phase 8). */
export function getContent() {
  const c = Content.parse(mergeContent(seed));
  const text = (lines: string[]) => lines.filter((l) => !hasPlaceholder(l) || process.env.NODE_ENV === "development");
  const items = orderItems(visible(c.items), c.ordering);
  return {
    ...c,
    tldr: text(c.tldr),
    now: text(c.now),
    profiles: visible(c.profiles),
    experience: visible(c.experience),
    education: visible(c.education),
    papers: items.filter((i) => i.kind === "paper"),
    projects: items.filter((i) => i.kind === "project"),
    certs: visible(c.certs),
    faq: visible(c.faq),
  };
}

export type SiteContent = ReturnType<typeof getContent>;
