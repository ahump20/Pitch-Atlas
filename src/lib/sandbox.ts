import { v, type Vec3 } from './seam'
import type { PitchMotion } from '../data/types'

/*
  The Shape Lab model. A teaching model, not a measured predictor.

  The only input is spin tilt on a clock face. The output is a shape read: ride,
  drop, arm-side run, glove-side sweep, or a blended version. It deliberately has
  no rpm, velocity, efficiency, or inch magnitude. The spin axis still feeds the
  schematic ball so the visual can turn with the lesson.
*/

export const ANCHOR_NOTE =
  'A teaching model. Spin tilt sets the direction of the Magnus force: backspin creates ride, topspin creates drop, and sidespin creates run or sweep. This page describes shape only; it does not predict how far any arm moves a pitch.'

export interface BreakInputs {
  /** Spin tilt on the clock, in degrees. 0 = 12:00, 90 = 3:00, 180 = 6:00, 270 = 9:00. */
  tiltDeg: number
}

export interface BreakResult {
  tiltDeg: number
  clock: string
  verticalShape: PitchMotion['verticalShape']
  horizontalDir: PitchMotion['horizontalDir']
  shapeNote: string
  spinAxis: Vec3
  gyro: false
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function shapeFromTilt(tiltDeg: number): Pick<BreakResult, 'verticalShape' | 'horizontalDir' | 'shapeNote'> {
  const rad = (normalizeDeg(tiltDeg) * Math.PI) / 180
  const vertical = Math.cos(rad)
  const horizontal = Math.sin(rad)
  const verticalShape: PitchMotion['verticalShape'] =
    vertical > 0.38 ? 'ride' : vertical < -0.38 ? 'drop' : 'flat'
  const horizontalDir: PitchMotion['horizontalDir'] =
    horizontal > 0.38 ? 'arm-side' : horizontal < -0.38 ? 'glove-side' : 'none'

  if (verticalShape === 'ride' && horizontalDir === 'none') {
    return { verticalShape, horizontalDir, shapeNote: 'Pure ride. The pitch holds above the spinless path.' }
  }
  if (verticalShape === 'drop' && horizontalDir === 'none') {
    return { verticalShape, horizontalDir, shapeNote: 'Pure drop. The pitch falls under the spinless path.' }
  }
  if (verticalShape === 'flat' && horizontalDir === 'arm-side') {
    return { verticalShape, horizontalDir, shapeNote: 'Pure arm-side run. The pitch slides toward the throwing arm side.' }
  }
  if (verticalShape === 'flat' && horizontalDir === 'glove-side') {
    return { verticalShape, horizontalDir, shapeNote: 'Pure glove-side sweep. The pitch slides toward the glove side.' }
  }

  const v = verticalShape === 'ride' ? 'ride' : verticalShape === 'drop' ? 'drop' : 'flat carry'
  const h = horizontalDir === 'arm-side' ? 'arm-side run' : horizontalDir === 'glove-side' ? 'glove-side sweep' : 'no side action'
  return { verticalShape, horizontalDir, shapeNote: `Blended shape: ${v} with ${h}.` }
}

export function buildBreak({ tiltDeg }: BreakInputs): BreakResult {
  const norm = normalizeDeg(tiltDeg)
  const rad = (norm * Math.PI) / 180
  const spinAxis = v.normalize({
    x: Math.cos(rad),
    y: -Math.sin(rad),
    z: 0,
  })
  return {
    tiltDeg: norm,
    clock: tiltClock(norm),
    ...shapeFromTilt(norm),
    spinAxis,
    gyro: false,
  }
}

/** Format a tilt in degrees (0 = 12:00, clockwise) as a clock string like "1:30". */
export function tiltClock(tiltDeg: number): string {
  const norm = normalizeDeg(tiltDeg)
  const totalMin = Math.round((norm / 360) * 12 * 60)
  const h = Math.floor(totalMin / 60) % 12
  const m = totalMin % 60
  const hour = h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')}`
}

/** Plain-English read of the resulting pitch shape. Neutral on handedness. */
export function describeShape(r: BreakResult): string {
  return r.shapeNote
}
