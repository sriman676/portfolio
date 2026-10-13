/**
 * Canonical origin for metadata, JSON-LD, sitemap and llms files.
 * NEXT_PUBLIC_SITE_URL wins (set in Phase 2.5); Vercel's production domain is the fallback, then local dev.
 */
export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
