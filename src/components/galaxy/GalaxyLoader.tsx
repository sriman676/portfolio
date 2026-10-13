"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { pickTier, readSignals, type Tier } from "@/lib/tier";

// three + R3F live only in this lazy chunk; nothing 3D is in the HTML-path bundle (CLAUDE.md rule 6).
const GalaxyCanvas = dynamic(() => import("./GalaxyCanvas"), { ssr: false });

/** Any render error in the 3D tree falls back to the still image + HTML, never a page crash (CLAUDE.md rule 8). */
class GalaxyBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    document.documentElement.classList.remove("has-3d");
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function GalaxyLoader() {
  const [tier, setTier] = useState<Tier | null>(null);
  const toLow = useCallback(() => setTier("low"), []);

  useEffect(() => {
    // Decide after first paint, when the main thread is idle, so the 3D never competes with the HTML.
    const decide = () => setTier(pickTier(readSignals()));
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(decide, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(decide, 1200);
    return () => clearTimeout(id);
  }, []);

  if (!tier || tier === "low") return null;
  return (
    <GalaxyBoundary onError={toLow}>
      <GalaxyCanvas tier={tier} onLow={toLow} />
    </GalaxyBoundary>
  );
}
