// Official PoE Orbit Radii from GGG fullscreen-atlas-skill-tree
export const OFFICIAL_ORBIT_RADII = [0, 82, 162, 335, 493, 662, 846];

// Official PoE Skills Per Orbit from GGG fullscreen-atlas-skill-tree
export const OFFICIAL_SKILLS_PER_ORBIT = [1, 6, 16, 16, 40, 72, 72];

// Official PoE Orbit Angles Mapping (in degrees)
export const OFFICIAL_ORBIT_ANGLES_BY_ORBIT: Record<number, number[]> = {
  0: [0],
  1: [0, 60, 120, 180, 240, 300],
  2: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],
  3: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],
  4: [
    0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 135, 140, 150,
    160, 170, 180, 190, 200, 210, 220, 225, 230, 240, 250, 260, 270, 280, 290,
    300, 310, 315, 320, 330, 340, 350
  ],
  5: Array.from({ length: 72 }, (_, i) => (i / 72) * 360),
  6: Array.from({ length: 72 }, (_, i) => (i / 72) * 360)
};

/**
 * Calculates exact angular placement (in degrees) for a node on a given orbit
 */
export function getNodeAngleDeg(orbit: number, orbitIndex: number): number {
  const angles = OFFICIAL_ORBIT_ANGLES_BY_ORBIT[orbit];
  if (angles && orbitIndex >= 0 && orbitIndex < angles.length) {
    return angles[orbitIndex];
  }
  const skillsCount = OFFICIAL_SKILLS_PER_ORBIT[orbit] || 1;
  return (orbitIndex / skillsCount) * 360;
}
