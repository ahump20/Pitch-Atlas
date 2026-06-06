import { activeSpinSplit } from './physics'
import { v, type Vec3 } from './seam'

/*
  The Build-the-Break model. A teaching model, not a measured predictor.

  What is real physics here: the spin TILT sets the direction of the Magnus force,
  and the spin EFFICIENCY sets how much of the spin does Magnus work — the rest is
  gyro spin that tips the axis toward the catcher and moves nothing. Both fall out
  of the same cross product the rest of the atlas uses (see physics.ts): a ball
  tilted to 12:00 is pure backspin and rides; 6:00 is topspin and drops; 3:00 and
  9:00 are pure sidespin.

  What is a calibrated teaching scale: the break MAGNITUDE in inches. Real induced
  break depends on the specific arm, release, and air. Here break scales with the
  active-spin share, and the scale is anchored so a league-average four-seam
  (~2,300 rpm, ~90% active, ~94 mph) lands near its real +16 in of induced vertical
  break — the 2024 MLB league mean. Read the inches as the shape, not a promise.
*/

// Inches of total induced break per 1,000 rpm of active spin, at the reference
// velocity. Anchored to the league four-seam: 7.6 x (2300*0.90/1000) x 1 ~= 15.7 in.
const BREAK_PER_ACTIVE_KRPM = 7.6
const REFERENCE_VELO_MPH = 94
// Slower pitches hang longer, so the Magnus force has longer to act. Clamped so an
// eephus does not read as an impossible break.
const FLIGHT_FACTOR = { min: 0.85, max: 1.25 }
// Below this active share the pitch is gyro-dominant: the axis points at the
// catcher and reads as a dot, not a line.
const GYRO_THRESHOLD_PCT = 34

export const ANCHOR_NOTE =
  'A teaching model. The break direction is real physics — the spin tilt sets where the Magnus force points, and efficiency sets how much of the spin does work. The inch magnitudes are a calibrated scale anchored to a league-average four-seam (~2,300 rpm, ~90% active, ~94 mph ≈ +16 in of induced vertical break, the 2024 MLB league mean), not a per-arm prediction.'

export interface BreakInputs {
  /** Spin tilt on the clock, in degrees. 0 = 12:00 (pure ride), 90 = 3:00, 180 = 6:00 (pure drop), 270 = 9:00. */
  tiltDeg: number
  /** Total spin rate, rpm. */
  rpm: number
  /** Spin efficiency: the active (transverse) share of spin, 0..100. */
  effPct: number
  /** Release velocity, mph. */
  veloMph: number
}

export interface BreakResult {
  activeRpm: number
  gyroRpm: number
  efficiencyPct: number
  /** Total induced break magnitude, inches (teaching scale). */
  totalBreakIn: number
  /** Signed induced vertical break, inches. + rides, - drops. */
  ivbInches: number
  /** Horizontal break magnitude, inches. */
  horizontalInches: number
  horizontalDir: 'arm-side' | 'glove-side' | 'none'
  /** Render-space unit spin axis for the seam ball. */
  spinAxis: Vec3
  /** Gyro-dominant: most spin is bullet spin, the axis points at the catcher. */
  gyro: boolean
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function buildBreak({ tiltDeg, rpm, effPct, veloMph }: BreakInputs): BreakResult {
  const { activeRpm, gyroRpm, efficiencyPct } = activeSpinSplit(rpm, effPct)
  const flight = clamp(REFERENCE_VELO_MPH / Math.max(veloMph, 1), FLIGHT_FACTOR.min, FLIGHT_FACTOR.max)
  const totalBreakIn = BREAK_PER_ACTIVE_KRPM * (activeRpm / 1000) * flight

  const rad = (tiltDeg * Math.PI) / 180
  const ivb = totalBreakIn * Math.cos(rad)
  const horizSigned = totalBreakIn * Math.sin(rad)

  // The Magnus force direction (-axis.y, axis.x, 0) is the movement; inverting it
  // gives the axis that produces this tilt. The gyro share leans the axis at the
  // catcher (+z in render space), exactly as a low-efficiency slider does.
  const e = efficiencyPct / 100
  const spinAxis = v.normalize({
    x: e * Math.cos(rad),
    y: e * -Math.sin(rad),
    z: 1 - e,
  })

  const horizontalInches = Math.round(Math.abs(horizSigned))
  const horizontalDir: BreakResult['horizontalDir'] =
    horizontalInches < 1 ? 'none' : horizSigned > 0 ? 'arm-side' : 'glove-side'

  return {
    activeRpm: Math.round(activeRpm),
    gyroRpm: Math.round(gyroRpm),
    efficiencyPct,
    totalBreakIn: Math.round(totalBreakIn * 10) / 10,
    ivbInches: Math.round(ivb),
    horizontalInches,
    horizontalDir,
    spinAxis,
    gyro: efficiencyPct < GYRO_THRESHOLD_PCT,
  }
}

/** Format a tilt in degrees (0 = 12:00, clockwise) as a clock string like "1:30". */
export function tiltClock(tiltDeg: number): string {
  const norm = ((tiltDeg % 360) + 360) % 360
  const totalMin = Math.round((norm / 360) * 12 * 60)
  const h = Math.floor(totalMin / 60) % 12
  const m = totalMin % 60
  const hour = h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')}`
}

/** Plain-English read of the resulting pitch shape. Neutral on handedness. */
export function describeShape(r: BreakResult): string {
  if (r.gyro) {
    return 'Mostly bullet spin — the axis points at the catcher, so the Magnus force does little. A pitch like this lives on deception and gravity, not on lift.'
  }
  const vert =
    r.ivbInches > 3 ? 'rides' : r.ivbInches < -3 ? 'drops hard' : 'holds close to its line vertically'
  const side =
    r.horizontalInches < 2
      ? 'with almost no side-to-side run'
      : `with about ${r.horizontalInches} in toward the ${r.horizontalDir === 'arm-side' ? 'arm' : 'glove'} side`
  return `This ball ${vert} ${side}.`
}
