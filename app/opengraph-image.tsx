import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";

const { person } = getContent();
export const alt = `${person.name}: ${person.pitch}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card built from content: name, pitch, TL;DR, and the black hole from the hero. */
export default function OpengraphImage() {
  const c = getContent();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#05070F", color: "#E7ECF5", padding: 72, position: "relative" }}>
        <div style={{ position: "absolute", right: 70, top: 155, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 999, background: "radial-gradient(circle, rgba(255,170,90,0.35) 0%, rgba(255,140,60,0.12) 45%, rgba(5,7,15,0) 70%)" }}>
          <div style={{ width: 170, height: 170, borderRadius: 999, background: "#000", boxShadow: "0 0 0 3px rgba(255,238,205,0.95), 0 0 40px 14px rgba(255,170,90,0.5)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 720, gap: 22 }}>
          <div style={{ fontSize: 26, color: "#6FE3E9", fontFamily: "monospace" }}>{`${c.person.shortName.toLowerCase()}@cosmos:~$ whoami`}</div>
          <div style={{ fontSize: 68, fontWeight: 300, lineHeight: 1.05 }}>{c.person.name}</div>
          <div style={{ fontSize: 30, color: "#9AA4BD", lineHeight: 1.35 }}>{c.person.pitch}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {c.tldr.map((line) => (
              <div key={line} style={{ fontSize: 24, display: "flex" }}>
                <span style={{ color: "#F2B84B", width: 26, flexShrink: 0 }}>›</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
