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

/*
  Render-space frame (the 3D stage as the viewer sees it):
    +x: camera right        +y: up        +z: toward the camera
  The pitch travels away from the camera toward the plate, so its render-space
  velocity points in -z. Every pitch carries a unit spin axis in THIS frame, and
  the Magnus force it draws is spin x velocity, computed, never hand-placed. The
  four-seam's authored axis reproduces its verified straight-up arrow.
*/
export const RENDER_VELOCITY: Vec3 = { x: 0, y: 0, z: -1 }

/** Direction of the Magnus force in render space for a given unit spin axis. */
export function magnusForceRender(spinAxis: Vec3): Vec3 {
  return v.normalize(v.cross(spinAxis, RENDER_VELOCITY))
}

/**
 * Transverse (active) fraction of the spin, 0..1: |spin x velocity| with unit
 * vectors is sin(angle between axis and flight), which is exactly the share of
 * spin that does Magnus work. A four-seam returns ~1 (all transverse); a gyro
 * slider returns a small number (mostly bullet spin). Used to scale the drawn
 * force arrow so its length reads the real efficiency.
 */
export function magnusStrength(spinAxis: Vec3): number {
  return v.length(v.cross(v.normalize(spinAxis), RENDER_VELOCITY))
}
