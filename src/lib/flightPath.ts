import type { PitchAtlasEntry } from '../data/types'
import { magnusStrength } from './physics'

/*
  The flight figure's geometry (TunnelPlot draws it). The endpoint is the sourced
  shape bucket; the side and the rise a path bends toward come from those same words;
  the authored spin vector only sets how late it leaves the shared line. Layout units,
  never a measurement.
*/
export const W = 360
export const H = 380
export const CX = W / 2
export const CY = 232
const COL = 96 // horizontal direction offset
const ROW = 76 // vertical direction offset
export const CLAMP = 124
/** half the length of the vertical axis through the spinless endpoint */
export const AXIS = 100
// the shared release sits at the top of the frame: one point both pitches leave from.
export const RELEASE_Y = 24
// the tunnel window sits where two well-tunneled pitches still look like one pitch:
// below the release and above every endpoint, so each path falls from it, a ride
// included (a ride falls less; it never climbs back toward the mound).
export const TUNNEL_Y = 80

export interface Spot {
  entry: PitchAtlasEntry
  /** endpoint, in the sourced break direction. */
  x: number
  y: number
  /** the cubic's control points, from the release to the endpoint */
  c1x: number
  c1y: number
  c2x: number
  c2y: number
}

const sideOf = (dir: PitchAtlasEntry['motion']['horizontalDir']) => (dir === 'arm-side' ? 1 : dir === 'glove-side' ? -1 : 0)
// render +y is up; SVG's y runs down
const riseOf = (shape: PitchAtlasEntry['motion']['verticalShape']) => (shape === 'ride' ? 1 : shape === 'drop' ? -1 : 0)

/*
  One pitch's path, mirrored for handedness. A spinless ball would fall straight from
  the release to the centre. A pitch's break adds to that line as the square of the
  way travelled (a full-Magnus pitch) up toward the cube (a near-pure gyro, which holds
  the line longest), so every path leaves the release on the shared line and bends
  late, toward the side and the rise its shape words name. The first control point
  sits a third of the way down the spinless line; the second between that line and
  the endpoint.
*/
export function plot(entry: PitchAtlasEntry, handFactor: number, nudge = 0): Spot {
  const m = entry.motion
  const x = Math.max(CX - CLAMP, Math.min(CX + CLAMP, CX + sideOf(m.horizontalDir) * handFactor * COL + nudge))
  const y = CY - riseOf(m.verticalShape) * ROW
  // 0 for full Magnus .. 0.6 for a pure gyro; past 0.6 a late ride would hook back up
  const late = 0.6 * (1 - Math.max(0, Math.min(1, magnusStrength(m.spinAxis))))
  return {
    entry,
    x,
    y,
    c1x: CX,
    c1y: RELEASE_Y + (CY - RELEASE_Y) / 3,
    c2x: (CX + (1 + late) * CX + (1 - late) * x) / 3,
    c2y: (RELEASE_Y + (1 + late) * CY + (1 - late) * y) / 3,
  }
}
