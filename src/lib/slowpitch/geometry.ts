/*
  Slow-pitch Flight Lab: units, field geometry and the ball.

  Pure numbers, no React and no three. Everything downstream (the flight, the
  zone, the batter, the verdict) reads from here, so the 3D scene, the 2D
  schematic and the page text can never disagree about where the plate is.

  Frame (metres, documented so the math is auditable):
    x: across the plate. Negative x is the batter's side (the lefty box), so a
       negative `side` on a lob is an inside pitch.
    y: up from the ground.
    z: along the pitch line, toward the catcher. The plate's front edge sits at
       z = -8.5 in, the line where its straight sides end at z = 0, and its back
       point at z = +8.5 in. The pitcher is at large negative z.

  The figures here are the model the original Flight Lab build ran on. The
  rulebook figures that a visitor reads (arc limits, bat length) are sourced as
  Claims in `src/data/softball/flightLab.ts`; these are their model inputs.
*/

/** A 3-vector as a plain tuple: the integrator's working type. */
export type Vec3 = [number, number, number]

/** One foot, in metres. */
export const FT = 0.3048
/** One inch, in metres. */
export const IN = 0.0254
/** One mile per hour, in metres per second. */
export const MPH = 0.44704
/** One revolution per minute, in radians per second. */
export const RPM = Math.PI / 30

/** Home plate: 17 in wide, front edge to back point 17 in. */
export const PLATE = {
  halfWidth: 8.5 * IN,
  /** z of the front edge (the pitcher's side). */
  front: -8.5 * IN,
  /** z of the back point. */
  back: 8.5 * IN,
} as const

/** The plate's outline in (x, z), front edge first, back point last. */
export const PLATE_POLYGON: ReadonlyArray<readonly [number, number]> = [
  [-PLATE.halfWidth, PLATE.front],
  [PLATE.halfWidth, PLATE.front],
  [PLATE.halfWidth, 0],
  [0, PLATE.back],
  [-PLATE.halfWidth, 0],
]

/** z of the pitcher's plate: 50 ft in front of the plate's back point. */
export const PITCHERS_PLATE_Z = PLATE.back - 50 * FT

/**
 * The strike mat used under Senior rules, as the original build modelled it: a
 * 17 in wide rectangle running 32.5 in back from the line where the plate's
 * straight sides end (z = 0). The plate itself covers the front.
 */
export const MAT = {
  length: 32.5 * IN,
  halfWidth: 8.5 * IN,
} as const

/** Where every modelled lob leaves the hand, in metres. */
export const RELEASE = { x: -0.2, y: 0.86, z: -14 } as const

/** A 12 in circumference softball's radius, in metres. */
export const BALL_RADIUS = (12 * IN) / (2 * Math.PI)
/** Cross-sectional area of the ball, m^2. */
export const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS
/** Ball mass, kg. */
export const BALL_MASS = 0.187
/** Gravity, m/s^2. */
export const GRAVITY = 9.81
/** Air density, kg/m^3. */
export const AIR_DENSITY = 1.2
/** Drag coefficient. A constant, borrowed from baseball-style fits (approximate). */
export const DRAG_COEFFICIENT = 0.45

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function length(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2])
}

export function scale(a: Vec3, k: number): Vec3 {
  return [a[0] * k, a[1] * k, a[2] * k]
}

/** Unit vector along `a`; a zero vector comes back unchanged rather than NaN. */
export function normalize(a: Vec3): Vec3 {
  return scale(a, 1 / (length(a) || 1))
}
