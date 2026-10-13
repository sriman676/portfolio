import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** SPEC §9: search engines and the listed AI crawlers may read everything except the edit API. */
export default function robots(): MetadataRoute.Robots {
  const disallow = "/api/";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/", disallow },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
