import type { SiteContent } from "@/lib/content";
import { STATUS } from "@/lib/status";

/**
 * SPEC §9 JSON-LD for "/": Person + ProfilePage, ScholarlyArticle per paper (creativeWorkStatus = its status),
 * SoftwareSourceCode per project, EducationalOccupationalCredential per earned cert, FAQPage.
 * Built only from filtered content, so hidden, draft and placeholder entries never appear.
 */
export function profileGraph(c: SiteContent, base: string) {
  const id = (fragment: string) => `${base}/#${fragment}`;
  const author = { "@id": id("person") };
  const earned = c.certs.filter((cert) => cert.status === "earned");
  const current = c.experience.filter((e) => !e.end);

  const credentials = earned.map((cert, i) => ({
    "@type": "EducationalOccupationalCredential",
    "@id": id(`credential-${i + 1}`),
    name: cert.title,
    credentialCategory: "certificate",
    recognizedBy: { "@type": "Organization", name: cert.issuer },
    ...(cert.verifyUrl && { url: cert.verifyUrl }),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": id("page"),
        url: `${base}/`,
        name: c.person.name,
        description: c.person.pitch,
        dateModified: c.updatedAt,
        mainEntity: author,
      },
      {
        "@type": "Person",
        "@id": id("person"),
        name: c.person.name,
        alternateName: c.person.shortName,
        description: c.person.bio,
        url: `${base}/`,
        ...(c.person.photo && { image: `${base}${c.person.photo}` }),
        email: `mailto:${c.links.email}`,
        homeLocation: { "@type": "Place", name: c.person.location },
        sameAs: [...new Set([c.links.github, c.links.linkedin, c.links.orcid, ...c.profiles.map((p) => p.url)])],
        knowsAbout: c.skills.flatMap((g) => g.items),
        alumniOf: c.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
        ...(current.length > 0 && { worksFor: current.map((e) => ({ "@type": "Organization", name: e.org })) }),
        hasCredential: credentials.map((cred) => ({ "@id": cred["@id"] })),
      },
      ...c.papers.map((p) => ({
        "@type": "ScholarlyArticle",
        "@id": id(`work-${p.slug}`),
        name: p.title,
        ...(p.subtitle && { alternativeHeadline: p.subtitle }),
        abstract: p.blurb,
        creativeWorkStatus: STATUS[p.status].label,
        author,
        keywords: p.skills.join(", "),
      })),
      ...c.projects.map((p) => {
        const repo = p.links?.find((l) => l.url.startsWith("https://github.com/"));
        return {
          "@type": "SoftwareSourceCode",
          "@id": id(`work-${p.slug}`),
          name: p.title,
          description: p.blurb,
          creativeWorkStatus: STATUS[p.status].label,
          author,
          keywords: p.skills.join(", "),
          ...(repo && { codeRepository: repo.url }),
        };
      }),
      ...credentials,
      {
        "@type": "FAQPage",
        "@id": id("faq"),
        mainEntity: c.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** JSON for an inline <script type="application/ld+json">; escapes "<" so content can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
