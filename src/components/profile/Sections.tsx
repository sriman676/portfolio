import type { ReactNode } from "react";
import type { Flagged, SiteContent } from "@/lib/content";
import type { Item } from "@/data/schema";
import { formatMonth, formatRange } from "@/lib/format";
import { NeedsOwner, StatusBadge } from "./StatusBadge";

/** Section heading paired with the ⌘K command that shows the same thing (docs/DESIGN_DECISION.md). */
function Section({ id, title, command, children, className, empty }: { id: string; title: string; command?: string; children: ReactNode; className?: string; empty?: boolean }) {
  if (empty) return null;
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={className}>
      <div className="sec-head">
        <h2 id={`${id}-h`}>{title}</h2>
        {command && <span className="how">{command}</span>}
      </div>
      {children}
    </section>
  );
}

function ItemRow({ item, compact }: { item: Flagged<Item>; compact?: boolean }) {
  const showMetrics = item.metricsPublic && item.metrics && item.metrics.length > 0;
  return (
    <li className={compact ? "row row-compact" : "row"}>
      <div>
        <h3>{item.title}</h3>
        {(item.subtitle || item.role) && <p className="sub">{[item.subtitle, item.role].filter(Boolean).join(". ")}</p>}
      </div>
      <span><StatusBadge status={item.status} /> <NeedsOwner show={item.needsOwner} /></span>
      <p className="blurb">{item.blurb}</p>
      {!compact && item.skills.length > 0 && <p className="tags">{item.skills.join(", ")}</p>}
      {showMetrics && (
        <ul className="metrics" aria-label={`${item.title} results`}>
          {item.metrics!.map((m) => (
            <li key={m.label}><b>{m.value}</b><span>{m.label}{m.note ? `, ${m.note}` : ""}</span></li>
          ))}
        </ul>
      )}
      {item.links && item.links.length > 0 && (
        <ul className="links">
          {item.links.map((l) => <li key={l.url}><a href={l.url} aria-label={`${item.title} on ${l.label}`}>{l.label}</a></li>)}
        </ul>
      )}
    </li>
  );
}

export function Sections({ c }: { c: SiteContent }) {
  const featured = c.projects.filter((p) => p.featured);
  const more = c.projects.filter((p) => !p.featured && p.source !== "github");
  const githubOnly = c.projects.filter((p) => !p.featured && p.source === "github");
  return (
    <>
      {c.now.length > 0 && (
        <Section id="now" title="Now" command="now">
          <p className="updated">Updated {formatMonth(c.updatedAt)}</p>
          <ul className="bullets">{c.now.map((line) => <li key={line}>{line}</li>)}</ul>
        </Section>
      )}

      <Section id="experience" title="Experience" command="experience" empty={c.experience.length === 0}>
        <ul className="rows">
          {c.experience.map((e) => (
            <li className="row" key={`${e.org}-${e.start}`}>
              <div><h3>{e.org}</h3><p className="sub">{e.title}</p></div>
              <span className="when">{formatRange(e.start, e.end)}</span>
              <p className="blurb">{e.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="research" title="Research" command="papers" empty={c.papers.length === 0}>
        <ul className="rows">{c.papers.map((p) => <ItemRow key={p.slug} item={p} />)}</ul>
      </Section>

      <Section id="projects" title="Projects" command="projects" empty={c.projects.length === 0}>
        <ul className="rows">{featured.map((p) => <ItemRow key={p.slug} item={p} />)}</ul>
        {more.length > 0 && (
          <>
            <h3 className="subhead">More projects</h3>
            <ul className="rows">{more.map((p) => <ItemRow key={p.slug} item={p} compact />)}</ul>
          </>
        )}
        {githubOnly.length > 0 && (
          <>
            <h3 className="subhead">More on GitHub</h3>
            <ul className="rows">{githubOnly.map((p) => <ItemRow key={p.slug} item={p} compact />)}</ul>
          </>
        )}
      </Section>

      <Section id="skills" title="Skills" command="skills" empty={c.skills.length === 0}>
        <dl className="skills">
          {c.skills.map((g) => (
            <div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(", ")}</dd></div>
          ))}
        </dl>
      </Section>

      <Section id="certifications" title="Certifications" command="certs" empty={c.certs.length === 0}>
        <ul className="rows">
          {c.certs.map((cert) => (
            <li className="row row-compact" key={cert.title}>
              <div><h3>{cert.title}</h3><p className="sub">{cert.issuer}</p></div>
              <span className={`badge ${cert.status === "earned" ? "b-done" : "b-wip"}`}>{cert.status === "earned" ? "Earned" : "In progress"}</span>
              {cert.verifyUrl && (
                <ul className="links"><li><a href={cert.verifyUrl} aria-label={`Verify ${cert.title}`}>Verify</a></li></ul>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="education" title="Education" empty={c.education.length === 0}>
        <ul className="rows">
          {c.education.map((e) => (
            <li className="row" key={`${e.school}-${e.degree}`}>
              <div><h3>{e.school}</h3><p className="sub">{e.degree}</p></div>
              <span className="when">{e.start} – {e.end}</span>
              {e.showCgpa && e.cgpa && <p className="blurb">CGPA {e.cgpa}</p>}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="faq" title="FAQ" empty={c.faq.length === 0}>
        <dl className="faq">
          {c.faq.map((f) => (
            <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>
          ))}
        </dl>
      </Section>

      <Section id="contact" title="Get in touch" command="contact" className="contact">
        <p>{c.terminal.hireMessage}</p>
        <div className="actions">
          <a className="btn btn-primary" href={`mailto:${c.links.email}`}>{c.links.email}</a>
          <a className="btn btn-ghost" href={c.links.linkedin}>LinkedIn</a>
          <a className="btn btn-ghost" href={c.links.github}>GitHub</a>
        </div>
      </Section>
    </>
  );
}
