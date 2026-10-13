import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// shortcut: only "/" exists so far; add /work/<slug> and /notes when Phase 5 creates those pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const { updatedAt } = getContent();
  return [{ url: `${siteUrl()}/`, lastModified: `${updatedAt}-01`, changeFrequency: "monthly", priority: 1 }];
}
