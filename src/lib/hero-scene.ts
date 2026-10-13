// One definition of the hero framing and disk, shared by the 3D shader and the still renderer so they match.

export const HERO_CAMERA = {
  position: [0, 2.6, -30] as [number, number, number], // slightly above the disk plane (≈ 5°)
  fov: 40, // vertical, degrees
  aspect: 2, // still image is 2:1 (the hero band)
};

export const DISK = {
  rIn: 3, // ISCO
  rOut: 11,
  peakKelvin: 4300,
  exposure: 0.9,
  transmission: 0.25, // light from behind that still passes through the disk
};
