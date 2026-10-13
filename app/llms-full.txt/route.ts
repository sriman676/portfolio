import { getContent } from "@/lib/content";
import { profileMarkdown } from "@/lib/llms";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return new Response(profileMarkdown(getContent(), siteUrl(), true), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
