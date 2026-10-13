import type { Status } from "@/data/schema";
import { STATUS } from "@/lib/status";

/** SPEC §3.4: exactly one status badge per item. */
export function StatusBadge({ status }: { status: Status }) {
  const { label, tone } = STATUS[status];
  return <span className={`badge ${tone}`}>{label}</span>;
}

/** Dev-only marker for entries the owner still has to fill (SPEC §4.3). */
export function NeedsOwner({ show }: { show?: boolean }) {
  return show ? <span className="badge b-todo">needs owner</span> : null;
}
