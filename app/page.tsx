import type { Metadata } from "next";
import Image from "next/image";
import { Rail } from "@/components/profile/Rail";
import { Sections } from "@/components/profile/Sections";
import { getContent } from "@/lib/content";
import { profileGraph, serializeJsonLd } from "@/lib/jsonld";
import { baseOpenGraph } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

export function generateMetadata(): Metadata {
  return { alternates: { canonical: "/" }, openGraph: { ...baseOpenGraph(), url: "/" } };
}

export default function Home() {
  const c = getContent();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileGraph(c, siteUrl())) }} />
      <a className="skip" href="#content">Skip to content</a>
      <div className="shell">
        <header className="hero" aria-label={`About ${c.person.shortName}`}>
          {/* In world mode (3D on) the hero becomes a scroll runway and this stage stays pinned (GALAXY §2.2). */}
          <div className="hero-stage">
            <div className="void" role="img" aria-label="A black hole: a dark shadow ringed by light, with a glowing accretion disk whose far side bends over the top.">
              {/* Ray-traced with the same physics as the 3D layer (scripts/render-hero-still.mjs); hidden once 3D draws. */}
              <Image className="void-still" src="/hero-still.png" alt="" fill sizes="(max-width: 860px) 100vw, 900px" preload />            </div>
            <Rail c={c} />
            <p className="intro-hint" aria-hidden="true">Scroll to enter</p>
          </div>
        </header>
        <main id="content" className="content" tabIndex={-1}>
          <Sections c={c} />
        </main>
      </div>
    </>
  );
}
