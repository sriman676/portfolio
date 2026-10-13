import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { formatMonth } from "@/lib/format";
import { TypedText } from "./TypedText";

// The pitch types out after `whoami` (SPEC §3.3: ≈ 1.2 s total, instant under reduced motion).
const WHOAMI_STEP_MS = 45;
const PITCH_STEP_MS = 8;

export function Rail({ c }: { c: SiteContent }) {
  const pitchStart = "whoami".length * WHOAMI_STEP_MS + 120;
  return (
    <aside className="rail" aria-label={`About ${c.person.shortName}`}>
      <p className="prompt">
        {c.person.shortName.toLowerCase()}@cosmos:~$ <span className="cmdtext"><TypedText text="whoami" stepMs={WHOAMI_STEP_MS} /></span>
      </p>
      {c.person.photo && (
        <div className="holo">
          <Image src={c.person.photo} alt={`Illustrated avatar of ${c.person.shortName}`} width={128} height={128} preload />
          <i /><i /><i /><i />
        </div>
      )}
      <h1 className="name">{c.person.name}</h1>
      <p className="pitch"><TypedText text={c.person.pitch} startMs={pitchStart} stepMs={PITCH_STEP_MS} /></p>
      {c.availability.open && <p className="avail">{c.availability.text}</p>}
      {c.tldr.length > 0 && (
        <ul className="tldr" aria-label="In short">
          {c.tldr.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
      <div className="actions">
        <a className="btn btn-primary" href={`mailto:${c.links.email}`}>Email me</a>
        {c.links.resume && <a className="btn btn-ghost" href={c.links.resume}>Download résumé</a>}
      </div>
      <ul className="profiles" aria-label="Profiles">
        {c.profiles.map((p) => (
          <li key={p.platform}><a href={p.url}>{p.platform} <small>{p.handle}</small></a></li>
        ))}
        {!c.profiles.some((p) => p.platform === "LinkedIn") && <li><a href={c.links.linkedin}>LinkedIn</a></li>}
      </ul>
      <p className="rail-foot"><span>{c.person.location}</span><span>updated {formatMonth(c.updatedAt)}</span></p>
    </aside>
  );
}
