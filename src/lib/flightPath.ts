import type { PitchAtlasEntry } from '../data/types'
import { magnusForceRender, magnusStrength } from './physics'

/*
  The flight figure's geometry (TunnelPlot draws it). The endpoint is the sourced
  shape bucket; the side and the rise a path bends toward come from those same words;
  the authored spin vector only sets how hard it bends and how late it leaves the
  shared line. Layout units, never a measurement.
*/
export const W = 520
export const H = 470
export const CX = W / 2
export const CY = H / 2 + 18
const COL = 130 // horizontal direction offset
const ROW = 118 // vertical direction offset
export const CLAMP = 178
// the shared release sits at the top of the frame: one point both pitches leave from.
export const RELEASE_Y = CY - CLAMP - 6
// the tunnel window sits where two well-tunneled pitches still look like one pitch:
// below the release, above center, on the line every path shares before it splits.
export const TUNNEL_Y = CY - 150

export interface Spot {
  entry: PitchAtlasEntry
  /** endpoint, in the sourced break direction. */
  x: number
  y: number
  /** the point on the straight line where the path starts to bow away from it. */
  baseX: number
  baseY: number
  /** the control point of the late-splitting path (where it bows away from the shared line). */
  ctrlX: number
  ctrlY: number
}

const sideOf = (dir: PitchAtlasEntry['motion']['horizontalDir']) => (dir === 'arm-side' ? 1 : dir === 'glove-side' ? -1 : 0)
// render +y is up; SVG's y runs down
const riseOf = (shape: PitchAtlasEntry['motion']['verticalShape']) => (shape === 'ride' ? 1 : shape === 'drop' ? -1 : 0)

/*
  One pitch's path geometry. The endpoint is the sourced shape bucket, mirrored for
  handedness. A full-Magnus pitch leaves the straight line sooner and bows harder; a
  gyro stays on it longer and bows less. The bow points the way the shape words say.
*/
export function plot(entry: PitchAtlasEntry, handFactor: number, nudge = 0): Spot {
  const m = entry.motion
  const side = sideOf(m.horizontalDir)
  const rise = riseOf(m.verticalShape)
  const endX = Math.max(CX - CLAMP, Math.min(CX + CLAMP, CX + side * handFactor * COL + nudge))
  const endY = CY - rise * ROW

  const force = magnusForceRender(m.spinAxis)
  const strength = Math.max(0, Math.min(1, magnusStrength(m.spinAxis)))

  const splitT = 0.52 + (1 - strength) * 0.26 // 0.52 (full Magnus) .. ~0.78 (pure gyro)
  const baseX = CX + (endX - CX) * splitT
  const baseY = TUNNEL_Y + (endY - TUNNEL_Y) * splitT

  const bow = 26 + strength * 30
  const ctrlX = baseX + side * handFactor * Math.abs(force.x) * bow
  const ctrlY = baseY - rise * Math.abs(force.y) * bow

  return { entry, x: endX, y: endY, baseX, baseY, ctrlX, ctrlY }
}
