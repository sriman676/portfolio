import type { Status } from "@/data/schema";

/** SPEC §3.4 wording, shared by the badge, JSON-LD `creativeWorkStatus`, llms files and /agents. */
export const STATUS: Record<Status, { label: string; tone: string }> = {
  published: { label: "Published", tone: "b-done" },
  shipped: { label: "Shipped", tone: "b-done" },
  "under-review": { label: "Under review", tone: "b-wip" },
  "in-preparation": { label: "In preparation", tone: "b-wip" },
  "in-progress": { label: "In progress", tone: "b-wip" },
  proposal: { label: "Proposal", tone: "b-prop" },
  "on-github": { label: "On GitHub", tone: "b-gh" },
  "TODO(owner)": { label: "Status needed", tone: "b-todo" },
};
