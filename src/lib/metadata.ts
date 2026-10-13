import type { Metadata } from "next";
import { getContent } from "@/lib/content";

/** Shared Open Graph fields. Next replaces (doesn't merge) `openGraph` per segment, so pages spread this in. */
export function baseOpenGraph(): NonNullable<Metadata["openGraph"]> {
  const { person, tldr } = getContent();
  return {
    type: "profile",
    siteName: person.name,
    title: person.name,
    description: [person.pitch, ...tldr].join(" "),
    locale: "en_US",
  };
}
