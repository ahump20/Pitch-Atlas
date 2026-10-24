import { IN, PLATE } from './geometry'

/*
  The batter: one measured swing, scaled to any height.

  The default is one batter's real swing, measured from their own video and
  calibrated off home plate (confidence `community-firsthand`; the source and
  note live in `src/data/softball/flightLab.ts`). It is never named. Every ratio
  below is a fraction of standing height so the same swing scales to a taller or
  shorter batter. The barrel angle at contact comes from one swing and is
  unverified.

  The lab's idea: your eyes judge a lob over the plate, but the barrel meets it
  out front, where a falling lob is still higher. So contact sits a stride and an
  arm's reach in front of where the batter stands, and the sweet spot reaches a
  fixed distance from the hands.
*/

export type BoxPosition = 'front' | 'middle' | 'back'

/** Where and how a batter stands. Lengths in inches. */
export interface Stance {
  /** Standing height. */
  heightIn: number
  /** Toes to the plate's inside edge. */
  toesIn: number
  /** Where in the box. */
  box: BoxPosition
  /** Bat length. */
  batIn: number
}

/** The measured batter's stance: 5 ft 2 in, toes 22 in off the plate, middle of
    the box, a 34 in bat. */
export const DEFAULT_STANCE: Stance = { heightIn: 62, toesIn: 22, box: 'middle', batIn: 34 }

/** Bat diameter, for labels (34 x 2 1/4 in). Not a model input. */
export const BAT_DIAMETER_IN = 2.25

/** Bat lengths the lab compares against (a batter's old baseball or softball bat). */
export const COMPARE_BATS = [31, 32, 33] as const

/** The measured swing's proportions. */
export const BATTER_MODEL = {
  /** Landmark heights as fractions of standing height. */
  landmarks: { knee: 0.242, belt: 0.503, chest: 0.661, shoulder: 0.79 },
  /** Stance centre's distance off the toes line, per inch of height. */
  stanceDepthPerHeight: 0.089,
  /** Stride toward the pitcher at contact, per inch of height. */
  stridePerHeight: 0.16,
  /** Hands' reach from the body at contact, per inch of height. */
  armReachPerHeight: 0.3432,
  /** Sweet spot, inches in from the barrel end. */
  sweetSpotFromEndIn: 6,
  /** Hands' grip point, inches up the handle from the knob (read from the
      model's own arithmetic, not a separate measurement). */
  handsFromKnobIn: 3,
  /** Barrel angle at contact, degrees below level (one swing; unverified). */
  barrelAngleDeg: 10,
  /** Beyond this angle from straight out, contact moves toward the hands. */
  maxContactAngleDeg: 52,
  /** Degrees past that angle over which the barrel fades to the hands. */
  contactAngleFalloffDeg: 16,
  /** Inches past full reach over which the barrel fades off the end. */
  endFalloffIn: 3,
  /** Heights within this many inches beyond the knee or shoulder still rate. */
  bodyBandIn: 6,
  /** Score at or above which a pitch is "your pitch". */
  hotThreshold: 0.8,
  /** Score at or above which a pitch is still reachable on the barrel. */
  warmThreshold: 0.5,
  /** Box position along the pitch line, inches (front is toward the pitcher). */
  boxOffsetIn: { front: -16, middle: 0, back: 16 } as Record<BoxPosition, number>,
} as const

export interface Landmarks {
  knee: number
  belt: number
  chest: number
  shoulder: number
}

/** The batter's landmark heights for a standing height, metres. */
export function landmarks(heightIn: number): Landmarks {
  const h = heightIn * IN
  const r = BATTER_MODEL.landmarks
  return { knee: r.knee * h, belt: r.belt * h, chest: r.chest * h, shoulder: r.shoulder * h }
}

/**
 * Distance from the hands to the sweet spot at contact, metres: the arm's reach
 * plus the bat from grip to sweet spot, laid back by the barrel angle.
 */
export function sweetSpotReach(heightIn: number, batIn: number): number {
  const m = BATTER_MODEL
  const barrel = (batIn - m.sweetSpotFromEndIn - m.handsFromKnobIn) * Math.cos((m.barrelAngleDeg * Math.PI) / 180)
  return (m.armReachPerHeight * heightIn + barrel) * IN
}

/** Where the batter stands, (x, z) metres. x is on the batter's side (negative). */
export function stanceSpot(stance: Stance): { x: number; z: number } {
  return {
    x: -(PLATE.halfWidth + (stance.toesIn + BATTER_MODEL.stanceDepthPerHeight * stance.heightIn) * IN),
    z: BATTER_MODEL.boxOffsetIn[stance.box] * IN,
  }
}

/** The pivot the swing turns on at contact: the stance spot after the stride. */
export function contactPivot(stance: Stance): { x: number; z: number } {
  const s = stanceSpot(stance)
  return { x: s.x, z: s.z - BATTER_MODEL.stridePerHeight * stance.heightIn * IN }
}

/** How the barrel meets a ball at a given distance across the plate. */
export interface Reach {
  /** How far in front of the pivot contact happens, metres. */
  forward: number
  /** Angle of the bat from straight out across the plate, degrees. */
  angleDeg: number
  /** 1 on the sweet spot, fading to 0 toward the hands or off the end. */
  lateral: number
  /** Where on the bat it lands. */
  side: 'barrel' | 'jam' | 'end'
}

/**
 * Meet a ball `x` metres across the plate. Out of reach, the ball fades off the
 * end of the bat. In reach, contact sits in front of the pivot on the reach
 * circle; a ball too close in forces the bat round and jams the hands.
 */
export function reachAt(stance: Stance, x: number): Reach {
  const m = BATTER_MODEL
  const r = sweetSpotReach(stance.heightIn, stance.batIn)
  const across = x - contactPivot(stance).x
  if (across >= r) {
    const lateral = Math.max(0, 1 - (across - r) / IN / m.endFalloffIn)
    return { forward: 0, angleDeg: 0, lateral, side: lateral < m.warmThreshold ? 'end' : 'barrel' }
  }
  const forward = Math.sqrt(r * r - across * across)
  const angleDeg = (Math.atan2(forward, across) * 180) / Math.PI
  const lateral =
    angleDeg <= m.maxContactAngleDeg ? 1 : Math.max(0, 1 - (angleDeg - m.maxContactAngleDeg) / m.contactAngleFalloffDeg)
  return { forward, angleDeg, lateral, side: lateral < m.warmThreshold ? 'jam' : 'barrel' }
}

/**
 * How good a contact height is for this batter, 0..1: full marks from the belt
 * to the chest, easing off toward the knee and the shoulder, and gone a few
 * inches past either.
 */
export function heightComfort(heightIn: number, y: number): number {
  const { knee, belt, chest, shoulder } = landmarks(heightIn)
  const band = BATTER_MODEL.bodyBandIn * IN
  if (y >= belt && y <= chest) return 1
  if (y < belt) {
    return y >= knee ? 0.4 + (0.6 * (y - knee)) / (belt - knee) : Math.max(0, 0.4 * (1 - (knee - y) / band))
  }
  return y <= shoulder ? 1 - (0.55 * (y - chest)) / (shoulder - chest) : Math.max(0, 0.45 * (1 - (y - shoulder) / band))
}

/** What the 34 in bat changes against a shorter one, for a ball down the middle. */
export interface BatComparison {
  /** How much farther the sweet spot reaches, inches. */
  reachGapIn: number
  /** Out front of the pivot at contact, inches: [this bat, the other bat]. */
  outFrontIn: [number, number]
  /** How much farther off the plate to stand to meet the ball where the other
      bat did, inches. */
  matchShiftIn: number
}

/** Compare the stance's bat with a bat of `otherIn` inches. */
export function compareBats(stance: Stance, otherIn: number): BatComparison {
  const across = -contactPivot(stance).x
  const r = sweetSpotReach(stance.heightIn, stance.batIn)
  const rOther = sweetSpotReach(stance.heightIn, otherIn)
  const forward = Math.sqrt(Math.max(0, r * r - across * across))
  const forwardOther = Math.sqrt(Math.max(0, rOther * rOther - across * across))
  const acrossToMatch = Math.sqrt(Math.max(0, r * r - forwardOther * forwardOther))
  return {
    reachGapIn: (r - rOther) / IN,
    outFrontIn: [forward / IN, forwardOther / IN],
    matchShiftIn: (acrossToMatch - across) / IN,
  }
}
