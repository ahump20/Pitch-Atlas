import { v, SEAM_VIEW_TILT } from '../../lib/seam'
import type { PitchMotion } from '../../data/types'

/*
  The movement wheel's geometry, in its 200-unit view box: a catcher's-eye target that
  plots the pitch's break DIRECTION and its spin axis, both straight off the sourced
  PitchMotion record. The SVG on the page back (ScoutMovementWheel) and the export's
  canvas back draw this one geometry, so the wheel a visitor saves is the wheel they
  turned over. It is a direction read, never a magnitude: the arrow has one fixed length
  because the data model stores no measured break by design. A knuckleball scatters; no
  motion record draws the empty wheel and says so.
*/

export const WHEEL_VIEW = 200
export const WHEEL_CENTER = 100
export const WHEEL_RADIUS = 78

export interface WheelLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface MovementWheelGeometry {
  filed: boolean
  /** target ring radii, outermost first */
  rings: number[]
  /** clock ticks at 12, 3, 6 and 9 (filed wheels only) */
  ticks: WheelLine[]
  /** the render-only spin axis the ball turns on */
  axis: WheelLine | null
  /** the break direction at its fixed length, with the two strokes of its head */
  arrow: { shaft: WheelLine; head: [WheelLine, WheelLine] } | null
  /** the knuckleball's deterministic scatter */
  scatter: Array<{ x: number; y: number }>
  /** radius of the dot at the centre, when one is drawn */
  centerDot: number | null
  /** the gyro pitch's red dot toward the viewer */
  gyro: boolean
  /** the empty wheel's level bar */
  flatLine: WheelLine | null
  label: string
  note: string
  ariaLabel: string
}

const VERT: Record<PitchMotion['verticalShape'], { dy: number; word: string }> = {
  ride: { dy: -1, word: 'Rides' },
  drop: { dy: 1, word: 'Drops' },
  flat: { dy: 0, word: 'Holds plane' },
}
const HORZ: Record<PitchMotion['horizontalDir'], { dx: number; word: string }> = {
  'arm-side': { dx: 1, word: 'arm-side run' },
  'glove-side': { dx: -1, word: 'glove-side' },
  none: { dx: 0, word: '' },
}

const cx = WHEEL_CENTER
const cy = WHEEL_CENTER
const R = WHEEL_RADIUS
const RINGS = [R, R * 0.62, R * 0.28]

export function movementWheel(motion: PitchMotion | undefined): MovementWheelGeometry {
  if (!motion) {
    return {
      filed: false,
      rings: RINGS,
      ticks: [],
      axis: null,
      arrow: null,
      scatter: [],
      centerDot: null,
      gyro: false,
      flatLine: { x1: cx - 34, y1: cy, x2: cx + 34, y2: cy },
      label: 'Motion not filed',
      note: 'source gap · no estimate',
      ariaLabel: 'Break direction not filed. No motion record is shown because Pitch Atlas has not sourced one.',
    }
  }

  const vert = VERT[motion.verticalShape]
  const horz = HORZ[motion.horizontalDir]

  // spin axis projected the same way the seam ball projects it, so the wheel and
  // the ball can never disagree about which way the axis tilts
  const sa = v.rotateAxis(v.normalize(motion.spinAxis), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
  const axk = R * 0.94
  const axis: WheelLine = { x1: cx - sa.x * axk, y1: cy + sa.y * axk, x2: cx + sa.x * axk, y2: cy - sa.y * axk }

  const ticks = [0, 90, 180, 270].map((deg) => {
    const a = (deg / 180) * Math.PI
    return { x1: cx + Math.sin(a) * (R - 6), y1: cy - Math.cos(a) * (R - 6), x2: cx + Math.sin(a) * R, y2: cy - Math.cos(a) * R }
  })

  // break direction from the categorical enums at a fixed length: arm-side points
  // right, ride points up (the catcher's-eye orientation), never how far it moves
  let dx = horz.dx
  let dy = vert.dy
  const mag = Math.hypot(dx, dy)
  const indeterminate = Boolean(motion.indeterminateBreak) || (mag === 0 && !motion.gyro)
  if (mag > 0) {
    dx /= mag
    dy /= mag
  }
  const arrowLen = R * 0.64
  const ax = cx + dx * arrowLen
  const ay = cy + dy * arrowLen
  const aang = Math.atan2(ay - cy, ax - cx)
  const headLen = 11
  const spread = 0.45
  const arrow: MovementWheelGeometry['arrow'] =
    !indeterminate && mag > 0
      ? {
          shaft: { x1: cx, y1: cy, x2: ax, y2: ay },
          head: [
            { x1: ax, y1: ay, x2: ax - headLen * Math.cos(aang - spread), y2: ay - headLen * Math.sin(aang - spread) },
            { x1: ax, y1: ay, x2: ax - headLen * Math.cos(aang + spread), y2: ay - headLen * Math.sin(aang + spread) },
          ],
        }
      : null

  // a deterministic scatter for the knuckleball (no Date, no random: prerenders clean)
  const scatter = indeterminate
    ? [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.7
        const rr = R * (0.3 + 0.13 * (i % 3))
        return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }
      })
    : []

  const label = indeterminate ? 'No fixed shape' : [vert.word, horz.word].filter(Boolean).join(' · ') || motion.forceLabel

  return {
    filed: true,
    rings: RINGS,
    ticks,
    axis,
    arrow,
    scatter,
    centerDot: indeterminate ? null : arrow ? 4 : 5,
    gyro: Boolean(motion.gyro),
    flatLine: null,
    label,
    note: `${motion.forceLabel} · direction only`,
    ariaLabel: `Break direction: ${label}. Spin axis shown. ${motion.forceLabel}. Direction only, never a measured magnitude.`,
  }
}
