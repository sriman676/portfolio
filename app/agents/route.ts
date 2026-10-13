import { getContent } from "@/lib/content";
import { agentsProfile } from "@/lib/llms";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json(agentsProfile(getContent(), siteUrl()));
}
