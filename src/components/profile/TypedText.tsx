import type { CSSProperties } from "react";

/**
 * Server-rendered typing effect: every character is in the HTML, revealed by a CSS delay (no JS).
 * Screen readers get the plain text once; reduced motion shows it instantly (globals.css).
 */
export function TypedText({ text, startMs = 0, stepMs }: { text: string; startMs?: number; stepMs: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="typed" aria-hidden="true">
        {Array.from(text, (ch, i) => (
          <span key={i} style={{ "--d": `${startMs + i * stepMs}ms` } as CSSProperties}>{ch}</span>
        ))}
      </span>
    </>
  );
}
