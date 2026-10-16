"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Governor, rungSettings, startRung } from "@/lib/governor";
import { HERO_CAMERA } from "@/lib/hero-scene";
import { introShot, introState, type IntroShot } from "@/lib/intro";
import type { Tier } from "@/lib/tier";
import { BlackHole } from "./BlackHole";
import { Starfield } from "./Starfield";

const STAR_COUNT = { high: 4000, medium: 2000 } as const;
const STEPS = { high: 180, medium: 80 } as const;
const DEBUG = process.env.NODE_ENV === "development";
let lossTestArmed = false; // dev-only ?galaxy=lose hook

/**
 * World mode turns the hero into a tall scroll runway (globals.css). Toggling it changes the page height, so a reader
 * already past the hero is moved by the same amount and keeps their place; one mid-intro lands back on the profile.
 */
function setWorld(on: boolean) {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero || root.classList.contains("world") === on) return;
  const before = hero.offsetHeight;
  const reading = scrollY + innerHeight > hero.offsetTop + before + 1;
  root.classList.toggle("world", on);
  if (reading) scrollBy({ top: hero.offsetHeight - before, behavior: "instant" });
  else if (!on) scrollTo({ top: hero.offsetTop, behavior: "instant" });
}

/**
 * Scroll intro (GALAXY §2.2): page scroll over the hero runway drives the camera through
 * orbit → spaghettification → horizon flash → emergence, and fades the HTML overlay via CSS variables.
 * Layout is read only on scroll/resize; each frame does work only when the progress changed.
 */
function IntroCamera({ onVisible }: { onVisible: (visible: boolean) => void }) {
  const shot = useRef<IntroShot>({ x: 0, y: 0, z: 0, lookY: 0, fov: 40, shiftX: 0, tidal: 0, whiteout: 0, text: 1, centered: 0, hint: 1 });
  const hero = useRef<HTMLElement | null>(null);
  const last = useRef({ p: -1, w: 0, h: 0 });
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".hero");
    if (!el) return;
    hero.current = el;
    setWorld(true);
    const read = () => {
      const r = el.getBoundingClientRect();
      const runway = r.height - innerHeight;
      introState.progress = runway > 0 ? Math.min(1, Math.max(0, -r.top / runway)) : 1;
      invalidate(); // one frame when the loop is on demand
    };
    read();
    addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
    // Past the hero the black hole is far away: stop the continuous loop (battery), keep on-demand renders.
    const visibility = new IntersectionObserver(([entry]) => onVisible(Boolean(entry?.isIntersecting)));
    visibility.observe(el);
    return () => {
      removeEventListener("scroll", read);
      removeEventListener("resize", read);
      visibility.disconnect();
      setWorld(false);
      for (const v of ["--intro-text", "--intro-hint", "--intro-white", "--intro-center"]) el.style.removeProperty(v);
      introState.tidal = 0;
    };
  }, [invalidate, onVisible]);

  useFrame((state) => {
    const p = introState.progress;
    const { width, height } = state.size;
    if (p === last.current.p && width === last.current.w && height === last.current.h) return;
    last.current = { p, w: width, h: height };
    const s = introShot(p, shot.current, width / height);
    const camera = state.camera as THREE.PerspectiveCamera;
    // A negative x offset draws the scene right of centre, beside the profile (the hero layout).
    if (s.shiftX > 0) camera.setViewOffset(width, height, -s.shiftX * width, 0, width, height);
    else camera.clearViewOffset();
    camera.position.set(s.x, s.y, s.z);
    camera.lookAt(0, s.lookY, 0);
    camera.fov = s.fov;
    camera.updateProjectionMatrix();
    introState.tidal = s.tidal;
    const style = hero.current?.style;
    style?.setProperty("--intro-text", s.text.toFixed(3));
    style?.setProperty("--intro-hint", s.hint.toFixed(3));
    style?.setProperty("--intro-white", s.whiteout.toFixed(3));
    style?.setProperty("--intro-center", String(s.centered));
  });
  return null;
}

/** Feeds frame times to the governor; reports rung changes outside the frame callback (no setState per frame). */
function GovernorDriver({ tier, active, onChange, onDebug }: { tier: Exclude<Tier, "low">; active: boolean; onChange: (rung: number) => void; onDebug?: (text: string) => void }) {
  const governor = useRef<Governor | null>(null);
  const lastText = useRef(0);
  useFrame((state, delta) => {
    governor.current ??= new Governor(tier);
    const now = performance.now();
    // On-demand renders (hero off screen) come at scroll pace, not GPU pace: they must not lower quality.
    if (governor.current.sample(delta * 1000, now, !active)) {
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
      setWorld(false); // and the profile with it: the intro can't run without a context, which may never return
      setLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      // three.js re-initialises its renderer and re-uploads resources itself; resume and show 3D after a frame.
      performance.mark("cosmos:context-restored");
      setLost(false);
      setWorld(true);
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
        <IntroCamera onVisible={setHeroVisible} />
        <Starfield count={STAR_COUNT[quality]} visibleShare={settings.starScale} />
        <BlackHole lensing={settings.lensing} steps={STEPS[quality]} onFirstFrame={onFirstFrame} />
        <GovernorDriver tier={tier} active={heroVisible && !lost} onChange={setRung} onDebug={debug ? showDebug : undefined} />
      </Canvas>
      {debug && <div ref={debugRef} className="perf-debug" />}
    </>
  );
}
