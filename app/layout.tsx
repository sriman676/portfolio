import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getContent } from "@/lib/content";
import { baseOpenGraph } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap", variable: "--font-plex-sans" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });

/** SPEC §9 defaults for every route; pages set their own canonical. The OG image comes from app/opengraph-image.tsx. */
export function generateMetadata(): Metadata {
  const og = baseOpenGraph();
  const { person } = getContent();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: person.name, template: `%s | ${person.name}` },
    description: og.description,
    authors: [{ name: person.name }],
    openGraph: og,
    twitter: { card: "summary_large_image", title: person.name, description: og.description },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="stars" aria-hidden="true" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
