import { BALL_RADIUS, FT, IN, MAT, PLATE } from './geometry'
import {
  BATTER_MODEL,
  contactPivot,
  heightComfort,
  landmarks,
  reachAt,
  type Stance,
} from './batter'
import { descentAtDepth, descentDepthAtHeight, type Flight } from './flight'
import { ARC_RULES, distanceToPlate, inchesPastFront, legalArcWindow, onPlateOrMat, zoneBounds, type RuleKey } from './zone'

/*
  The verdicts: what the umpire calls, what the batter's barrel makes of it,
  and the landing window to look for. One set of functions feeds the 3D scene,
  the 2D schematic and the words on the page.
*/

/** The umpire's side of a pitch. */
export interface PitchCall {
  arcLegal: boolean
  /** Why the arc is or is not legal. */
  arcWhy: 'ok' | 'flat' | 'high'
  /** Did it pass the strike test (the zone in the air, or the mat for Senior)? */
  strike: boolean
  call: 'strike' | 'ball' | 'illegal'
  /** Which way a ball missed. */
  miss: 'none' | 'short' | 'long' | 'inside' | 'outside'
  /** The landing depths (z, metres) that would make this arc a strike. */
  lane: { min: number; max: number }
  /** Inches from the landing spot to the nearer end of the lane (negative outside it). */
  depthMarginIn: number
  /** Inches inside the plate's edge (negative outside it). */
  sideMarginIn: number
}

/**
 * Call a pitch under a rulebook for a batter of `heightIn`. Zone rules: a strike
 * is any part of the ball passing over the plate between the knee and the
 * shoulder. Senior rules: a strike lands on the plate or the mat.
 */
export function callPitch(flight: Flight, rule: RuleKey, heightIn: number): PitchCall {
  const [arcMin, arcMax] = legalArcWindow(rule)
  const peakFt = flight.apex[1] / FT
  const arcWhy = peakFt < arcMin - 1e-6 ? 'flat' : peakFt > arcMax + 1e-6 ? 'high' : 'ok'
  const { bottom, top } = zoneBounds(heightIn)
  const R = BALL_RADIUS
  const p = flight.positions
  const senior = ARC_RULES[rule].strike === 'mat'

  let lane: { min: number; max: number }
  let strike = false
  if (senior) {
    lane = { min: PLATE.front, max: MAT.length }
    strike = onPlateOrMat(flight.land.x, flight.land.z)
  } else {
    // Any part of the ball over the plate, inside the zone: check three points
    // per sample interval.
    for (let i = 1; i < flight.count && !strike; i++) {
      for (let k = 0; k < 3; k++) {
        const f = k / 3
        const x = p[i * 3 - 3] + (p[i * 3] - p[i * 3 - 3]) * f
        const y = p[i * 3 - 2] + (p[i * 3 + 1] - p[i * 3 - 2]) * f
        const z = p[i * 3 - 1] + (p[i * 3 + 2] - p[i * 3 - 1]) * f
        if (y >= bottom - R && y <= top + R && distanceToPlate(x, z) <= R) {
          strike = true
          break
        }
      }
    }
    // The lane: slide this same arc along the pitch line and keep the landing
    // spots whose zone-height stretch still overlaps the plate.
    let minZ = Infinity
    let maxZ = -Infinity
    for (let i = flight.apexIndex; i < flight.count; i++) {
      const y = p[i * 3 + 1]
      if (y >= bottom - R && y <= top + R) {
        minZ = Math.min(minZ, p[i * 3 + 2])
        maxZ = Math.max(maxZ, p[i * 3 + 2])
      }
    }
    lane = Number.isFinite(minZ)
      ? { min: flight.land.z + (PLATE.front - R - maxZ), max: flight.land.z + (PLATE.back + R - minZ) }
      : { min: PLATE.front, max: PLATE.back }
  }

  const landZ = flight.land.z
  const sideOver = Math.abs(flight.land.x) - (PLATE.halfWidth + (senior ? 0 : R))
  let miss: PitchCall['miss'] = 'none'
  if (!strike) {
    miss = landZ < lane.min ? 'short' : landZ > lane.max ? 'long' : flight.land.x < 0 ? 'inside' : 'outside'
  }
  return {
    arcLegal: arcWhy === 'ok',
    arcWhy,
    strike,
    call: arcWhy === 'ok' ? (strike ? 'strike' : 'ball') : 'illegal',
    miss,
    lane,
    depthMarginIn: Math.min(landZ - lane.min, lane.max - landZ) / IN,
    sideMarginIn: -sideOver / IN,
  }
}

/** The strike lane as inches past the plate's front edge, [from, to]. */
export function strikeWindowIn(call: PitchCall): [number, number] {
  return [inchesPastFront(call.lane.min), inchesPastFront(call.lane.max)]
}

/** Inches out in front of the plate's front edge for a depth z, metres. */
export function outFrontIn(z: number): number {
  return (PLATE.front - z) / IN
}

/** The batter's side of a pitch. */
export interface BatterContact {
  /** Where the barrel meets the ball, or null when the ball is down before it gets there. */
  contact: { x: number; y: number; z: number; forward: number; angleDeg: number } | null
  /** 0..1, sweet spot across the bat. */
  lateral: number
  /** 0..1, how good the contact height is. */
  vertical: number
  /** lateral x vertical. */
  score: number
  kind: 'pitch' | 'jam' | 'end' | 'low' | 'high'
}

/**
 * Where the barrel meets this pitch. The contact depth depends on how far
 * across the ball is, and how far across it is depends on the depth, so settle
 * the pair in two passes.
 */
export function meetBall(flight: Flight, stance: Stance): BatterContact {
  const m = BATTER_MODEL
  const pivot = contactPivot(stance)
  let x = flight.land.x
  let reach = reachAt(stance, x)
  for (let pass = 0; pass < 2; pass++) {
    const at = descentAtDepth(flight, pivot.z - reach.forward)
    if (!at) break
    x = at[0]
    reach = reachAt(stance, x)
  }
  const z = pivot.z - reach.forward
  const ball = descentAtDepth(flight, z)
  const l = landmarks(stance.heightIn)
  const vertical = ball ? heightComfort(stance.heightIn, ball[1]) : 0

  let kind: BatterContact['kind'] = 'pitch'
  if (reach.lateral < m.warmThreshold) kind = reach.side === 'end' ? 'end' : 'jam'
  else if (!ball || (ball[1] < l.belt && vertical < m.hotThreshold)) kind = 'low'
  else if (ball[1] > l.chest && vertical < m.hotThreshold) kind = 'high'

  return {
    contact: ball ? { x, y: ball[1], z, forward: reach.forward, angleDeg: reach.angleDeg } : null,
    lateral: reach.lateral,
    vertical,
    score: vertical * reach.lateral,
    kind,
  }
}

/** The landing window to look for at this arc. */
export interface LookFor {
  /** Inches past the plate's front edge where this arc is "your pitch". */
  hot: [number, number] | null
  /** Inches past the front edge where it still reaches the barrel. */
  warm: [number, number] | null
  /** Heights over the plate (inches) of the hot window's ends: [deepest, shortest]. */
  crossing: [number, number] | null
}

/**
 * Slide this arc along the pitch line, landing from 2.5 m shorter to 3.5 m
 * deeper in 1 cm steps, and score each landing at the batter's contact point
 * for a ball across at `x` (the middle of the plate by default in the UI).
 */
export function lookFor(flight: Flight, stance: Stance, x: number = flight.land.x): LookFor {
  const m = BATTER_MODEL
  const reach = reachAt(stance, x)
  const contactZ = contactPivot(stance).z - reach.forward
  const shifts: number[] = []
  const scores: number[] = []
  // Accumulated (not indexed) on purpose: the original stepped this way, and
  // the window ends land on the same samples only if the floats match.
  for (let s = -2.5; s <= 3.5 + 1e-9; s += 0.01) {
    const at = descentAtDepth(flight, contactZ - s)
    shifts.push(s)
    scores.push(at ? heightComfort(stance.heightIn, at[1]) * reach.lateral : 0)
  }
  let best = 0
  for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i

  const span = (threshold: number): [number, number] | null => {
    if (scores[best] < threshold) return null
    let lo = best
    let hi = best
    while (lo > 0 && scores[lo - 1] >= threshold) lo--
    while (hi < scores.length - 1 && scores[hi + 1] >= threshold) hi++
    return [lo, hi]
  }
  const landingIn = (i: number) => inchesPastFront(flight.land.z + shifts[i])

  const hot = span(m.hotThreshold)
  const warm = span(m.warmThreshold)
  let crossing: [number, number] | null = null
  if (hot) {
    const deep = descentAtDepth(flight, -shifts[hot[1]])
    const short = descentAtDepth(flight, -shifts[hot[0]])
    if (deep && short) crossing = [deep[1] / IN, short[1] / IN]
  }
  return {
    hot: hot ? [landingIn(hot[0]), landingIn(hot[1])] : null,
    warm: warm ? [landingIn(warm[0]), landingIn(warm[1])] : null,
    crossing,
  }
}

/** A grid of barrel scores over the plate face, for the heat overlay. */
export interface ReachHeatMap {
  /** Row-major scores, ny rows of nx. Row 0 is the ground. */
  values: Float32Array
  nx: number
  ny: number
  /** x range, metres. */
  x: [number, number]
  /** y range, metres. */
  y: [number, number]
}

/**
 * Score this arc's shape at every point of the plate face: for each cell, slide
 * the arc so it passes that height over that spot, and ask how the barrel meets
 * it there.
 */
export function reachHeatMap(flight: Flight, stance: Stance, nx = 48, ny = 72): ReachHeatMap {
  const l = landmarks(stance.heightIn)
  const half = PLATE.halfWidth + 6 * IN
  const xr: [number, number] = [-half, half]
  const yr: [number, number] = [0, l.shoulder + 14 * IN]
  const pivot = contactPivot(stance)
  const values = new Float32Array(nx * ny)
  for (let i = 0; i < nx; i++) {
    const reach = reachAt(stance, xr[0] + ((i + 0.5) / nx) * (xr[1] - xr[0]))
    const contactZ = pivot.z - reach.forward
    for (let j = 0; j < ny; j++) {
      const depth = descentDepthAtHeight(flight, yr[0] + ((j + 0.5) / ny) * (yr[1] - yr[0]))
      if (depth === null) continue
      const at = descentAtDepth(flight, contactZ + depth)
      values[j * nx + i] = at ? heightComfort(stance.heightIn, at[1]) * reach.lateral : 0
    }
  }
  return { values, nx, ny, x: xr, y: yr }
}

/** The headline a batter reads. */
export interface Verdict {
  /** The full headline, e.g. "Strike · jams you". */
  word: string
  /** The short form for a list row: Your pitch, Jams you, Too low, Too high, Off the end, Ball, Illegal. */
  short: string
  tone: 'good' | 'warn' | 'dim' | 'bad'
}

/** Put the umpire's call and the barrel's read into the batter's words. */
export function verdictFor(call: PitchCall, contact: BatterContact, shoulderY: number, rule: RuleKey): Verdict {
  if (call.call === 'illegal') {
    return {
      word: call.arcWhy === 'flat' ? 'Illegal arc · too flat' : 'Illegal arc · too high',
      short: 'Illegal',
      tone: 'bad',
    }
  }
  if (call.call === 'ball') {
    const where =
      ARC_RULES[rule].strike === 'mat'
        ? call.miss === 'short'
          ? 'short of the plate'
          : call.miss === 'long'
            ? 'past the mat'
            : 'off the mat'
        : call.miss === 'short'
          ? 'under your knees'
          : call.miss === 'long'
            ? 'over your shoulder'
            : 'off the plate'
    return { word: `Ball · ${where}`, short: 'Ball', tone: 'dim' }
  }
  switch (contact.kind) {
    case 'pitch':
      return { word: 'Your pitch', short: 'Your pitch', tone: 'good' }
    case 'jam':
      return { word: 'Strike · jams you', short: 'Jams you', tone: 'warn' }
    case 'end':
      return { word: 'Strike · off the end', short: 'Off the end', tone: 'warn' }
    case 'low':
      return { word: 'Strike · at your knees', short: 'Too low', tone: 'warn' }
    default:
      return contact.contact && contact.contact.y > shoulderY
        ? { word: 'Strike · over your shoulders', short: 'Too high', tone: 'warn' }
        : { word: 'Strike · up at your shoulders', short: 'Too high', tone: 'warn' }
  }
}

/** Everything the page says about one pitch, for one batter, under one rulebook. */
export interface PitchReading {
  call: PitchCall
  contact: BatterContact
  verdict: Verdict
  /** Landing window to look for, scored for a ball down the middle. */
  lookFor: LookFor
  /** The strike lane, inches past the front edge. */
  strikeWindowIn: [number, number]
  /** Peak height, ft. */
  apexFt: number
  /** Height over the plate's middle line, inches. */
  overPlateIn: number
  /** Angle it is falling at over the plate, degrees. */
  fallingAngleDeg: number
  /** The barrel at contact: height and how far out front of the plate. */
  barrel: { heightIn: number; outFrontIn: number } | null
}

export function judgePitch(flight: Flight, rule: RuleKey, stance: Stance): PitchReading {
  const call = callPitch(flight, rule, stance.heightIn)
  const contact = meetBall(flight, stance)
  const c = contact.contact
  return {
    call,
    contact,
    verdict: verdictFor(call, contact, landmarks(stance.heightIn).shoulder, rule),
    lookFor: lookFor(flight, stance, 0),
    strikeWindowIn: strikeWindowIn(call),
    apexFt: flight.apex[1] / FT,
    overPlateIn: flight.crossing.y / IN,
    fallingAngleDeg: flight.crossing.angle,
    barrel: c ? { heightIn: c.y / IN, outFrontIn: outFrontIn(c.z) } : null,
  }
}
