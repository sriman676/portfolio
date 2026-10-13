// Effects tier at load (SPEC §5.3, GALAXY §6). The governor (governor.ts) can only step down from here, never up past it.

export type Tier = "high" | "medium" | "low";

export interface DeviceSignals {
  reducedMotion: boolean;
  saveData: boolean;
  webgl2: boolean;
  cores: number;
  memoryGb?: number; // navigator.deviceMemory (Chromium only, capped at 8)
  finePointer: boolean; // mouse/trackpad, i.e. not a phone
  width: number;
}

export function pickTier(s: DeviceSignals): Tier {
  if (s.reducedMotion || s.saveData || !s.webgl2) return "low";
  const memory = s.memoryGb ?? 8;
  if (s.cores < 4 || memory < 4) return "low";
  if (s.finePointer && s.width >= 1024 && s.cores >= 8 && memory >= 8) return "high";
  return "medium";
}

/** Browser-only: read the signals pickTier needs. The WebGL2 probe context is released immediately. */
export function readSignals(): DeviceSignals {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  let webgl2 = false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    webgl2 = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    webgl2,
    cores: nav.hardwareConcurrency || 4,
    memoryGb: nav.deviceMemory,
    finePointer: matchMedia("(pointer: fine)").matches,
    width: innerWidth,
  };
}
