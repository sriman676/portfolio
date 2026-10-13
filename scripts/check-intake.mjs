#!/usr/bin/env node
// Intake gate (docs/INTAKE.md → "check:intake"). Exits 1 and lists every offender.
// `--prod` is accepted for the Phase 1+ prebuild hook; the checks are the same either way.
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const MARK = /TODO\(owner\)|\bVERIFY\b/;

/** Owner markers or drafts in content values. Items with `hide: true` are exempt. */
export function valueOffenders(content) {
  const out = [];
  const walk = (v, path) => {
    if (typeof v === "string") {
      if (MARK.test(v)) out.push(`${path}: "${v.slice(0, 70)}"`);
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${path}[${i}]`));
    } else if (v && typeof v === "object") {
      if (v.hide === true) return;
      const here = v.slug ? `${path}(${v.slug})` : path;
      if (v.draft === true) out.push(`${here}: draft: true but not hidden`);
      for (const [k, x] of Object.entries(v)) walk(x, `${here}.${k}`);
    }
  };
  walk(content, "content");
  return out;
}

/** Owner markers left in `//` comments of content.ts (values can't see them). */
export function commentOffenders(source) {
  return source.split("\n").flatMap((line, i) => {
    const c = line.indexOf("//");
    return c !== -1 && MARK.test(line.slice(c)) ? [`content.ts:${i + 1}: ${line.trim().slice(0, 90)}`] : [];
  });
}

/** Empty `ANSWER:` lines in INTAKE.md, ignoring fenced code blocks (the format example). */
export function answerOffenders(md) {
  const out = [];
  let fenced = false;
  let q = "(no question id)";
  for (const line of md.split("\n")) {
    if (line.trimStart().startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const id = line.match(/^###\s+\[(Q-[\w.-]+)\]/);
    if (id) q = id[1];
    if (/^ANSWER:\s*$/.test(line)) out.push(`INTAKE.md ${q}: ANSWER is empty`);
  }
  return out;
}

/** Synced repos with no decision: not a fork, not in hiddenRepos, not linked by any item's `repo`. */
export function repoOffenders(repos, content) {
  const known = new Set(
    [...content.hiddenRepos, ...content.items.map((i) => i.repo).filter(Boolean)].map((n) => n.toLowerCase()),
  );
  return repos
    .filter((r) => !r.fork && !known.has(r.name.toLowerCase()))
    .map((r) => `repo ${r.name}: no decision (add an item with repo: "${r.name}" or list it in hiddenRepos)`);
}

async function main() {
  const root = new URL("../", import.meta.url);
  const contentUrl = new URL("src/data/content.ts", root);
  const { content } = await import(pathToFileURL(fileURLToPath(contentUrl)).href);
  const [source, intake, synced] = await Promise.all([
    readFile(contentUrl, "utf8"),
    readFile(new URL("docs/INTAKE.md", root), "utf8"),
    readFile(new URL("docs/intake/github-repos.json", root), "utf8"),
  ]);
  const offenders = [
    ...valueOffenders(content),
    ...commentOffenders(source),
    ...answerOffenders(intake),
    ...repoOffenders(JSON.parse(synced).repos, content),
  ];
  if (offenders.length) {
    console.error(`check:intake FAILED (${offenders.length}):\n- ${offenders.join("\n- ")}`);
    process.exit(1);
  }
  console.log("check:intake passed");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
