import type { Status } from "@/data/schema";

const LABEL: Record<Status, [label: string, tone: string]> = {
  published: ["Published", "b-done"],
  shipped: ["Shipped", "b-done"],
  "under-review": ["Under review", "b-wip"],
  "in-preparation": ["In preparation", "b-wip"],
  "in-progress": ["In progress", "b-wip"],
  proposal: ["Proposal", "b-prop"],
  "on-github": ["On GitHub", "b-gh"],
  "TODO(owner)": ["Status needed", "b-todo"],
};

/** SPEC §3.4: exactly one status badge per item. */
export function StatusBadge({ status }: { status: Status }) {
  const [label, tone] = LABEL[status];
  return <span className={`badge ${tone}`}>{label}</span>;
}

/** Dev-only marker for entries the owner still has to fill (SPEC §4.3). */
export function NeedsOwner({ show }: { show?: boolean }) {
  return show ? <span className="badge b-todo">needs owner</span> : null;
}
