import type { Content, Item } from "@/data/schema";

/** Later sources (SPEC §4.2): GitHub repos (Phase 10, forks already dropped) and edit-mode KV overrides (Phase 8). */
export interface Overrides {
  github?: Item[];
  kv?: { upserts: Item[]; tombstones: string[] };
}

/**
 * Merge order seed ← GitHub ← KV with precedence KV > seed > GitHub (SPEC §4.2, §4.4).
 * A GitHub repo already linked by a seed item's `repo:`, or listed in `hiddenRepos`, adds nothing.
 * Tombstones hide seed/GitHub items; a later KV upsert with the same slug is shown again.
 */
export function mergeContent(seed: Content, { github = [], kv }: Overrides = {}): Content {
  const lower = (s?: string) => s?.toLowerCase();
  const claimed = new Set([...seed.hiddenRepos, ...seed.items.map((i) => i.repo)].map(lower));
  const tombstones = new Set(kv?.tombstones);
  const items = new Map(seed.items.map((i) => [i.slug, i]));
  for (const repo of github) {
    if (!claimed.has(lower(repo.repo)) && !items.has(repo.slug)) items.set(repo.slug, repo);
  }
  for (const slug of tombstones) items.delete(slug);
  for (const upsert of kv?.upserts ?? []) items.set(upsert.slug, upsert);
  return { ...seed, items: [...items.values()] };
}
