"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { introState } from "@/lib/intro";
import { blackbodyRGB } from "@/lib/physics/blackhole";
import { starsFragment, starsVertex } from "./shaders/stars";

/** Three depth shells (parallax layers) in one instanced draw call. Deterministic seed: the same sky every visit. */
const SHELLS = [
  { radius: 140, share: 0.5, size: 1.0 },
  { radius: 280, share: 0.32, size: 1.4 },
  { radius: 520, share: 0.18, size: 2.1 },
];

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({ count, visibleShare }: { count: number; visibleShare: number }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(0xc05305);
    const offsets = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    let i = 0;
    for (const shell of SHELLS) {
      const n = Math.round(count * shell.share);
      for (let k = 0; k < n && i < count; k++, i++) {
        const u = rand() * 2 - 1;
        const phi = rand() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const r = shell.radius * (0.85 + rand() * 0.3);
        offsets.set([r * s * Math.cos(phi), r * u, r * s * Math.sin(phi)], i * 3);
        // Real star colours: blackbody 3,000–30,000 K, skewed toward cool stars like the real sky
        const kelvin = 3000 + Math.pow(rand(), 2.2) * 27000;
        const brightness = 0.75 + Math.pow(rand(), 3) * 1.6;
        colors.set(blackbodyRGB(kelvin).map((c) => c * brightness), i * 3);
        sizes[i] = shell.size * (0.6 + rand() * 0.9);
      }
    }
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(sizes, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SHELLS[2]!.radius * 1.2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: starsVertex,
      fragmentShader: starsFragment,
      uniforms: { uVelocity: { value: new THREE.Vector3() }, uTidal: { value: 0 }, uPixelRatio: { value: 1 }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useEffect(() => { geometry.instanceCount = Math.floor(count * visibleShare); }, [geometry, count, visibleShare]);
  useEffect(() => { material.uniforms.uPixelRatio!.value = dpr; }, [material, dpr]);
  useFrame((state) => {
    material.uniforms.uTime!.value = state.clock.elapsedTime;
    material.uniforms.uTidal!.value = introState.tidal;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
