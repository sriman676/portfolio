import { describe, expect, it } from "vitest";
import { content } from "@/data/content";
import type { Item } from "@/data/schema";
import { getContent } from "@/lib/content";
import { profileGraph, serializeJsonLd } from "@/lib/jsonld";
import { agentsProfile, profileMarkdown } from "@/lib/llms";
import { mergeContent } from "@/lib/merge";
import { STATUS } from "@/lib/status";

const base = "https://example.test";
const item = (slug: string, title = slug): Item => ({ slug, kind: "project", title, blurb: "b", status: "shipped", skills: [] });

describe("mergeContent (SPEC §4.2)", () => {
  it("applies KV > seed > GitHub, keeps seed order, and honours tombstones", () => {
    const seed = { ...content, items: [item("a", "seed a"), item("b", "seed b")] };
    const merged = mergeContent(seed, {
      github: [item("a", "github a"), item("gh-new")],
      kv: { upserts: [item("b", "kv b"), item("kv-new")], tombstones: ["gh-new"] },
    });
    expect(merged.items.map((i) => `${i.slug}:${i.title}`)).toEqual(["a:seed a", "b:kv b", "kv-new:kv-new"]);
  });

  it("skips repos linked by a seed item's repo: or listed in hiddenRepos", () => {
    const seed = { ...content, hiddenRepos: ["Secret"], items: [{ ...item("soc-agentlab"), repo: "SOC" }] };
    const merged = mergeContent(seed, {
      github: [{ ...item("soc"), repo: "soc" }, { ...item("secret"), repo: "Secret" }, { ...item("fresh"), repo: "Fresh" }],
    });
    expect(merged.items.map((i) => i.slug)).toEqual(["soc-agentlab", "fresh"]);
  });

  it("shows an item again when it is re-added after a tombstone", () => {
    const seed = { ...content, items: [item("nexus", "old")] };
    const merged = mergeContent(seed, { kv: { upserts: [item("nexus", "new")], tombstones: ["nexus"] } });
    expect(merged.items.map((i) => i.title)).toEqual(["new"]);
  });
});

describe("JSON-LD (SPEC §9)", () => {
  const c = getContent();
  const graph = profileGraph(c, base)["@graph"] as Record<string, unknown>[];
  const ofType = (t: string) => graph.filter((n) => n["@type"] === t);

  it("has Person, ProfilePage and FAQPage", () => {
    expect(ofType("Person")).toHaveLength(1);
    expect(ofType("ProfilePage")).toHaveLength(1);
    expect(ofType("FAQPage")).toHaveLength(1);
  });

  it("gives every paper a creativeWorkStatus that matches its status", () => {
    for (const paper of c.papers) {
      const node = graph.find((n) => n["@id"] === `${base}/#work-${paper.slug}`);
      expect(node?.["@type"]).toBe("ScholarlyArticle");
      expect(node?.creativeWorkStatus).toBe(STATUS[paper.status].label);
    }
  });

  it("lists projects and earned certs only, never hidden ones", () => {
    expect(ofType("SoftwareSourceCode")).toHaveLength(c.projects.length);
    const creds = ofType("EducationalOccupationalCredential").map((n) => n.name);
    expect(creds).toContain("PCAP Analysis");
    expect(creds).not.toContain("MongoDB Associate Developer");
    expect(creds).not.toContain("AWS Certified Cloud Practitioner");
  });

  it("escapes < so content can't close the script tag", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});

describe("llms.txt, llms-full.txt and /agents", () => {
  const c = getContent();
  const outputs = [profileMarkdown(c, base), profileMarkdown(c, base, true), JSON.stringify(agentsProfile(c, base))];

  it("contain no placeholders or hidden items", () => {
    for (const out of outputs) {
      expect(out).not.toContain("TODO(owner)");
      expect(out).not.toContain("MongoDB Associate Developer");
      expect(out).not.toContain("AI Skills Fest");
    }
  });

  it("follow the llms.txt shape and only the full file carries results and roles", () => {
    expect(outputs[0]).toMatch(/^# Sriman Rutvik Voddiraju\n\n> /);
    expect(outputs[0]).not.toContain("Cohen's d = 2.86");
    expect(outputs[1]).toContain("Cohen's d = 2.86");
    expect(outputs[1]).toContain("Role: Sole author");
  });
});
