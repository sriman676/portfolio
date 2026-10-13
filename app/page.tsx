import { Rail } from "@/components/profile/Rail";
import { Sections } from "@/components/profile/Sections";
import { getContent } from "@/lib/content";

export default function Home() {
  const c = getContent();
  return (
    <>
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
