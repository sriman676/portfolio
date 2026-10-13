import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { getContent } from "@/lib/content";
import "./globals.css";

const sans = IBM_Plex_Sans({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap", variable: "--font-plex-sans" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-plex-mono" });

// Full metadata, OG and JSON-LD come in Phase 2 (SPEC §9).
export function generateMetadata(): Metadata {
  const { person } = getContent();
  return { title: person.name, description: person.pitch };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="stars" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
