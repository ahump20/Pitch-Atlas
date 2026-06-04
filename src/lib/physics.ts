import type { Vec3 } from './seam'
import { v } from './seam'

/*
  Physics helpers for the four-seam reference. Pure and testable.

  Frame (Alan Nathan's convention, documented so the math is auditable):
    x: toward the catcher's right (first-base side)
    y: from home plate toward the pitcher
    z: up

  A pitch travels from the pitcher toward the catcher, so its velocity points in
  -y. Pure backspin spins the top of the ball back toward the pitcher; by the
  right-hand rule that angular-velocity vector points in -x.
*/

export const PITCH_VELOCITY: Vec3 = { x: 0, y: -1, z: 0 }
export const BACKSPIN_AXIS: Vec3 = { x: -1, y: 0, z: 0 }

/**
 * Direction of the Magnus force, proportional to spin x velocity.
 * For backspin this comes out +z (up): the ball is pushed against the fall.
 */
export function magnusDirection(spinAxis: Vec3, velocity: Vec3): Vec3 {
  return v.normalize(v.cross(spinAxis, velocity))
}

/**
 * Sign of the induced vertical break: +1 the pitch rides (drops less), -1 it
 * drops more, 0 no vertical Magnus component. A four-seam returns +1.
 */
export function ivbSign(spinAxis: Vec3, velocity: Vec3): number {
  const z = magnusDirection(spinAxis, velocity).z
  return z > 1e-9 ? 1 : z < -1e-9 ? -1 : 0
}

export interface SpinSplit {
  activeRpm: number
  gyroRpm: number
  efficiencyPct: number
}

/**
 * Split total spin into the transverse (active) share that drives movement and
 * the gyro share that does not. Cole 2019: 2,530 rpm at 97.1% -> ~2,457 active.
 */
export function activeSpinSplit(totalRpm: number, efficiencyPct: number): SpinSplit {
  const eff = Math.max(0, Math.min(100, efficiencyPct))
  const activeRpm = (totalRpm * eff) / 100
  return { activeRpm, gyroRpm: totalRpm - activeRpm, efficiencyPct: eff }
}

/**
 * The carry gap drawn by the gravity ghost: how many inches less a spinning
 * four-seam drops than a spinless ball over the same flight. This IS the induced
 * vertical break. League average is about +16 in; the "15 to 20 in vs spinless"
 * span is approximate and depends on the arm.
 */
export const CARRY_GAP_AVG_IN = 16
