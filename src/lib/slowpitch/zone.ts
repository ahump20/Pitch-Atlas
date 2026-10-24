import { FT, IN, MAT, PLATE, PLATE_POLYGON, RELEASE } from './geometry'
import { landmarks } from './batter'

/*
  The rulebook side of the lab: the legal arc, the strike zone for a batter,
  and the plate and mat hit tests.

  The arc numbers here are the model's inputs. The rule text a visitor reads,
  and the source and confidence behind each figure, live as Claims in
  `src/data/softball/flightLab.ts`, which reads its numbers from ARC_RULES so
  the two can never drift.
*/

export type RuleKey = 'usssa' | 'usa' | 'senior'

export interface ArcRule {
  /** Lowest legal arc, ft. Measured from the ground, or from the release point
      when `arcMinFromRelease` is set. */
  arcMin: number
  /** Highest legal arc, ft above the ground. */
  arcMax: number
  /** USSSA measures its floor as a rise of `arcMin` ft after the ball leaves the
      hand; the others measure the peak from the ground. */
  arcMinFromRelease: boolean
  /** How a strike is called: through the zone in the air, or by where it lands
      (Senior: on the plate or the mat behind it). */
  strike: 'zone' | 'mat'
}

/**
 * The arc limits per rulebook, from each body's 2026 rule book:
 *  - USSSA: at least 3 ft above the hand, no more than 10 ft above the ground.
 *  - USA Softball adult slow pitch: 6 ft to 10 ft above the ground.
 *  - USA Softball Senior slow pitch: 6 ft to 12 ft above the ground.
 */
export const ARC_RULES: Record<RuleKey, ArcRule> = {
  usssa: { arcMin: 3, arcMax: 10, arcMinFromRelease: true, strike: 'zone' },
  usa: { arcMin: 6, arcMax: 10, arcMinFromRelease: false, strike: 'zone' },
  senior: { arcMin: 6, arcMax: 12, arcMinFromRelease: false, strike: 'mat' },
}

/** The legal peak window [min, max] in ft above the ground. */
export function legalArcWindow(rule: RuleKey, releaseHeight: number = RELEASE.y): [number, number] {
  const r = ARC_RULES[rule]
  return [r.arcMinFromRelease ? releaseHeight / FT + r.arcMin : r.arcMin, r.arcMax]
}

/**
 * The strike zone's bottom and top for a batter, in metres above the ground:
 * the front knee to the shoulder. USSSA writes "highest shoulder to the bottom
 * of the front knee", USA Softball "back shoulder to the front knee"; the model
 * draws both at the same landmarks. Senior play has no zone in the air (strikes
 * are called on the mat), so the band only frames the batter there.
 */
export function zoneBounds(heightIn: number): { bottom: number; top: number } {
  const l = landmarks(heightIn)
  return { bottom: l.knee, top: l.shoulder }
}

/** Shortest distance from (px, pz) to the segment (ax, az)-(bx, bz). */
function distanceToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

/** True when the point (x, z) on the ground is inside the plate's outline. */
export function insidePlate(x: number, z: number): boolean {
  let inside = false
  for (let i = 0, j = PLATE_POLYGON.length - 1; i < PLATE_POLYGON.length; j = i++) {
    const [xi, zi] = PLATE_POLYGON[i]
    const [xj, zj] = PLATE_POLYGON[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside
  }
  return inside
}

/** Distance from (x, z) to the plate, metres; 0 when over it. */
export function distanceToPlate(x: number, z: number): number {
  if (insidePlate(x, z)) return 0
  let best = Infinity
  for (let i = 0, j = PLATE_POLYGON.length - 1; i < PLATE_POLYGON.length; j = i++) {
    best = Math.min(
      best,
      distanceToSegment(x, z, PLATE_POLYGON[j][0], PLATE_POLYGON[j][1], PLATE_POLYGON[i][0], PLATE_POLYGON[i][1]),
    )
  }
  return best
}

/** Senior strike test: the ball's centre comes down on the plate or the mat. */
export function onPlateOrMat(x: number, z: number): boolean {
  return insidePlate(x, z) || (Math.abs(x) <= MAT.halfWidth && z >= 0 && z <= MAT.length)
}

/** Inches past the plate's front edge for a depth z, metres. */
export function inchesPastFront(z: number): number {
  return (z - PLATE.front) / IN
}
