import { test } from "node:test";
import assert from "node:assert/strict";
import { answerOffenders, commentOffenders, repoOffenders, valueOffenders } from "./check-intake.mjs";

test("markers in values fail unless the item is hidden", () => {
  const content = {
    person: { bio: "TODO(owner): rewrite" },
    items: [
      { slug: "a", blurb: "TODO(owner)", hide: true },
      { slug: "b", blurb: "ok", draft: true },
      { slug: "c", role: "x VERIFY y" },
    ],
  };
  const out = valueOffenders(content);
  assert.equal(out.length, 3);
  assert.ok(out.some((o) => o.includes("person.bio")));
  assert.ok(out.some((o) => o.includes("(b): draft")));
  assert.ok(out.some((o) => o.includes("(c).role")));
  assert.ok(!out.some((o) => o.includes("(a)")));
});

test("markers in comments fail, plain code does not", () => {
  const src = 'const a = 1; // VERIFY expansion\nconst url = "https://x.y"; // fine\n| "TODO(owner)";';
  assert.deepEqual(commentOffenders(src).length, 1);
});

test("empty ANSWER fails outside code fences only", () => {
  const md = "```\n### [Q-000] example\nANSWER:\n```\n### [Q-001] a\nANSWER: yes\n### [Q-002] b\nANSWER:\n";
  assert.deepEqual(answerOffenders(md), ["INTAKE.md Q-002: ANSWER is empty"]);
});

test("repos need a decision; forks and case differences are fine", () => {
  const content = { hiddenRepos: ["Old"], items: [{ repo: "FedDecept" }] };
  const repos = [{ name: "feddecept" }, { name: "old" }, { name: "Forked", fork: true }, { name: "New" }];
  assert.deepEqual(repoOffenders(repos, content).length, 1);
});
