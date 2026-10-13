import type { Metadata } from "next";
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
        <Rail c={c} />
        <main id="content" className="content" tabIndex={-1}>
          <div className="void" role="img" aria-label="A black hole: a dark shadow ringed by light, with a glowing accretion disk whose far side bends over the top.">
            <div className="bh" aria-hidden="true">
              <span className="halo" /><span className="lensed" /><span className="photon" /><span className="horizon" /><span className="disk" />
            </div>
            <p>Scroll to travel</p>
          </div>
          <Sections c={c} />
        </main>
      </div>
    </>
  );
}
