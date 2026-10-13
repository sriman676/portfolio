const month = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-08" → "Aug 2026" (EXTRAS §9 month precision). */
export function formatMonth(yyyyMm: string): string {
  return month.format(new Date(`${yyyyMm}-01T00:00:00Z`));
}

/** "Aug 2026 – present" / "Jul 2026 – Aug 2026". */
export function formatRange(start: string, end?: string): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "present"}`;
}
