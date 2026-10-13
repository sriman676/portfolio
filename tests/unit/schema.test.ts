import { describe, expect, it } from "vitest";
import { content } from "@/data/content";
import { Content, Item } from "@/data/schema";
import { orderItems, visible } from "@/lib/content";

const item = { slug: "demo", kind: "project", title: "Demo", blurb: "A demo.", status: "shipped", skills: [] } as const;

describe("content schema", () => {
  it("accepts the real content", () => {
    expect(Content.safeParse(content).success).toBe(true);
  });

  it("rejects javascript:, http: and credentialed URLs, unknown keys and bad slugs", () => {
    const withLink = (url: string) => Item.safeParse({ ...item, links: [{ label: "x", url }] }).success;
    expect(withLink("https://github.com/sriman676")).toBe(true);
    expect(withLink("javascript:alert(1)")).toBe(false);
    expect(withLink("http://example.com")).toBe(false);
    expect(withLink("https://user:pw@example.com")).toBe(false);
    expect(Item.safeParse({ ...item, extra: 1 }).success).toBe(false);
    expect(Item.safeParse({ ...item, slug: "Bad Slug" }).success).toBe(false);
    expect(Item.safeParse({ ...item, blurb: "x".repeat(401) }).success).toBe(false);
  });

  it("rejects off-site paths and impossible months", () => {
    const withPhoto = (photo: string) => Content.safeParse({ ...content, person: { ...content.person, photo } }).success;
    expect(withPhoto("/avatar.jpg")).toBe(true);
    expect(withPhoto("//evil.example/x.jpg")).toBe(false);
    expect(withPhoto("/../secret")).toBe(false);
    const withStart = (start: string) =>
      Content.safeParse({ ...content, experience: [{ ...content.experience[0]!, start }] }).success;
    expect(withStart("2026-08")).toBe(true);
    expect(withStart("2026-13")).toBe(false);
  });
});

describe("placeholder rule (SPEC §4.3)", () => {
  const list = [
    { slug: "ok", blurb: "done" },
    { slug: "todo", blurb: "TODO(owner): write me" },
    { slug: "hidden", blurb: "done", hide: true },
    { slug: "draft", blurb: "done", draft: true },
  ];
  it("drops placeholder, hidden and draft entries in production", () => {
    expect(visible(list, false).map((e) => e.slug)).toEqual(["ok"]);
  });
  it("keeps placeholder entries in development, flagged", () => {
    const dev = visible(list, true);
    expect(dev.map((e) => e.slug)).toEqual(["ok", "todo"]);
    expect(dev[1]?.needsOwner).toBe(true);
  });
});

describe("ordering (SPEC §4.5)", () => {
  const items = ["a", "b", "c", "d", "e"].map((slug) => ({ slug, featured: slug === "d" }));
  it("puts pins first and last, featured before the rest, seed order otherwise", () => {
    const out = orderItems(items, { preset: "featured-first", pinnedFirst: ["c"], pinnedLast: ["a"], manual: [] });
    expect(out.map((i) => i.slug)).toEqual(["c", "d", "b", "e", "a"]);
  });
});
