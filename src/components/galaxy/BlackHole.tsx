"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { DISK } from "@/lib/hero-scene";
import { BOUND_RADIUS, blackHoleFragment, blackHoleVertex } from "./shaders/blackhole";

/** Ray-traced Schwarzschild black hole at the origin. `steps` bounds the geodesic integration per pixel. */
export function BlackHole({ lensing, steps, onFirstFrame }: { lensing: boolean; steps: number; onFirstFrame: () => void }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const first = useRef(true);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSteps: { value: 0 },
      uLensing: { value: 0 },
      uRIn: { value: DISK.rIn },
      uROut: { value: DISK.rOut },
      uPeakK: { value: DISK.peakKelvin },
      uExposure: { value: DISK.exposure },
      uTransmission: { value: DISK.transmission },
    }),
    [],
  );

  useFrame((state) => {
    if (!material.current) return;
    const u = material.current.uniforms;
    u.uTime!.value = state.clock.elapsedTime;
    u.uSteps!.value = steps;
    u.uLensing!.value = lensing ? 1 : 0;
    if (first.current) {
      first.current = false;
      onFirstFrame();
    }
  });

  if (process.env.NODE_ENV === "development" && typeof location !== "undefined" && location.search.includes("galaxy=throw")) {
    throw new Error("Forced galaxy failure (?galaxy=throw)");
  }

  // JSX-created geometry and material are disposed by R3F on unmount.
  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[BOUND_RADIUS, 64, 32]} />
      <shaderMaterial
        ref={material}
        args={[{ vertexShader: blackHoleVertex, fragmentShader: blackHoleFragment, uniforms }]}
        transparent
        premultipliedAlpha
        depthWrite={false}
      />
    </mesh>
  );
}
