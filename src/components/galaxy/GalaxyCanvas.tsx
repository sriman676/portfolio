"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Governor, rungSettings, startRung } from "@/lib/governor";
import { HERO_CAMERA } from "@/lib/hero-scene";
import type { Tier } from "@/lib/tier";
import { BlackHole } from "./BlackHole";
import { Starfield } from "./Starfield";

const STAR_COUNT = { high: 4000, medium: 2000 } as const;
const STEPS = { high: 180, medium: 80 } as const;
const DEBUG = process.env.NODE_ENV === "development";
let lossTestArmed = false; // dev-only ?galaxy=lose hook
const HALF_STILL = Math.tan(THREE.MathUtils.degToRad(HERO_CAMERA.fov / 2));

/**
 * Keeps the black hole exactly where the hero band (.void) is, at the same scale as the still image there:
 * the view offset moves the projected origin to the band's centre and the FOV maps the band height to the
 * still's vertical FOV. Reads layout only on scroll/resize, never per frame.
 */
function HeroAnchor({ onVisible }: { onVisible: (visible: boolean) => void }) {
  const band = useRef({ x: 0, y: 0, h: 1, dirty: true });
  const lastSize = useRef({ w: 0, h: 0 });
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const el = document.querySelector(".void");
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      band.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, dirty: true };
      invalidate(); // renders one frame when the loop is on demand
    };
    read();
    addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
    // Layout can move the band without any scroll/resize event (font swap, wrapping): watch it directly.
    const resizes = new ResizeObserver(read);
    resizes.observe(el);
    const hero = el.closest(".hero");
    if (hero) resizes.observe(hero);
    // Off-screen hero: stop the continuous loop (battery), keep on-demand renders for scroll.
    const visibility = new IntersectionObserver(([entry]) => onVisible(Boolean(entry?.isIntersecting)));
    visibility.observe(el);
    return () => {
      removeEventListener("scroll", read);
      removeEventListener("resize", read);
      resizes.disconnect();
      visibility.disconnect();
    };
  }, [invalidate, onVisible]);

  useFrame((state) => {
    const { width, height } = state.size;
    if (width !== lastSize.current.w || height !== lastSize.current.h) {
      lastSize.current = { w: width, h: height }; // R3F resized the canvas after our scroll/resize read
      band.current.dirty = true;
    }
    if (!band.current.dirty) return;
    band.current.dirty = false;
    const { x, y, h } = band.current;
    const camera = state.camera as THREE.PerspectiveCamera;
    camera.lookAt(0, 0, 0);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((HALF_STILL * height) / h));
    camera.setViewOffset(width, height, width / 2 - x, height / 2 - y, width, height);
    camera.updateProjectionMatrix();
  });
  return null;
}

/** Feeds frame times to the governor; reports rung changes outside the frame callback (no setState per frame). */
function GovernorDriver({ tier, onChange, onDebug }: { tier: Exclude<Tier, "low">; onChange: (rung: number) => void; onDebug?: (text: string) => void }) {
  const governor = useRef<Governor | null>(null);
  const lastText = useRef(0);
  useFrame((state, delta) => {
    governor.current ??= new Governor(tier);
    const now = performance.now();
    if (governor.current.sample(delta * 1000, now)) {
      const rung = governor.current.rung;
      queueMicrotask(() => onChange(rung));
    }
    if (onDebug && now - lastText.current > 500) {
      lastText.current = now;
      const { calls, triangles } = state.gl.info.render;
      onDebug(`${governor.current.fps.toFixed(0)} fps · rung ${governor.current.name} · ${calls} calls · ${triangles} tris`);
    }
  });
  return null;
}

export default function GalaxyCanvas({ tier, onLow }: { tier: Exclude<Tier, "low">; onLow: () => void }) {
  const [rung, setRung] = useState(() => startRung(tier));
  const [lost, setLost] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const debugRef = useRef<HTMLDivElement>(null);
  const settings = rungSettings(rung);
  const showDebug = useCallback((text: string) => {
    if (debugRef.current) debugRef.current.textContent = text;
  }, []);
  const [debug] = useState(() => DEBUG && location.search.includes("perf=debug"));

  useEffect(() => {
    if (settings.tier === "low") onLow();
  }, [settings.tier, onLow]);

  const onFirstFrame = useCallback(() => {
    performance.mark("cosmos:bh-first-frame");
    document.documentElement.classList.add("has-3d");
  }, []);
  useEffect(() => () => document.documentElement.classList.remove("has-3d"), []);

  const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault(); // allows the browser to restore the context
      performance.mark("cosmos:context-lost");
      document.documentElement.classList.remove("has-3d"); // the still image shows again
      setLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      // three.js re-initialises its renderer and re-uploads resources itself; resume and show 3D after a frame.
      performance.mark("cosmos:context-restored");
      setLost(false);
      requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("has-3d")));
    });
    if (DEBUG && location.search.includes("galaxy=lose") && !lossTestArmed) {
      lossTestArmed = true; // once per page, or every rebuilt canvas would lose its context again
      const ext = gl.getContext().getExtension("WEBGL_lose_context");
      setTimeout(() => ext?.loseContext(), 3000);
      setTimeout(() => ext?.restoreContext(), 6000);
    }
  }, []);

  const quality = settings.tier === "high" ? "high" : "medium";
  return (
    <>
      <Canvas
        className="galaxy-canvas"
        aria-hidden="true"
        frameloop={lost ? "never" : heroVisible ? "always" : "demand"}
        dpr={[1, settings.maxDpr]}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ fov: HERO_CAMERA.fov, position: HERO_CAMERA.position, near: 0.1, far: 2000 }}
        onCreated={onCreated}
      >
        <HeroAnchor onVisible={setHeroVisible} />
        <Starfield count={STAR_COUNT[quality]} visibleShare={settings.starScale} />
        <BlackHole lensing={settings.lensing} steps={STEPS[quality]} onFirstFrame={onFirstFrame} />
        <GovernorDriver tier={tier} onChange={setRung} onDebug={debug ? showDebug : undefined} />
      </Canvas>
      {debug && <div ref={debugRef} className="perf-debug" />}
    </>
  );
}
