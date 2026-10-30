import {
  AIR_DENSITY,
  BALL_AREA,
  BALL_MASS,
  BALL_RADIUS,
  DRAG_COEFFICIENT,
  FT,
  GRAVITY,
  IN,
  MPH,
  PLATE,
  RELEASE,
  RPM,
  cross,
  length,
  normalize,
  scale,
  type Vec3,
} from './geometry'

/*
  The flight of a slow-pitch lob: gravity, drag and Magnus lift, integrated from
  the release point to the ground, and a solver that finds the throw for a lob
  described the way a batter sees it (how high it peaks, where it lands).

  Lift follows the fit Cl = 1 / (2.32 + 0.4 / S), with S = r * w_perp / v, the
  spin factor. That fit and the constant drag coefficient come from baseball
  aerodynamics; on a softball they are approximate. Spin is a model input only:
  it shapes the path, and no spin figure is ever shown to a visitor.

  A knuckler barely turns, so Magnus has almost nothing to work with; what moves
  it is the seams. As the ball creeps round, the seam pattern facing the air
  changes and pushes it sideways and up or down. That push follows Nelson and
  Strauss's knuckleball model: a force 1/2 rho A v^2 times C sin 4(angle), the
  four-fold beat of the seams passing a point, with C = 0.25. Their model is
  for a baseball; on a 12 in softball it is a model input, not a measurement.
  The pitcher aims the knuckler as if it had no seams; where it actually goes
  is the seams' doing.
*/

/** A lob described the way a batter reads it. */
export interface LobParams {
  /** Peak height above the ground, ft. */
  apex: number
  /** Where it lands, in inches past the plate's front edge. */
  land: number
  /** Inches across the plate from the middle; negative is inside. */
  side: number
  /** Backspin, rpm. A model input, never shown. */
  rpm: number
  /** Tilt of the spin axis off pure backspin, degrees: 180 is topspin, 90 side spin. */
  push: number
  /** Knuckle strength: the seam-force coefficient C (0 or absent: no knuckle). */
  knuckle?: number
  /** Where the seams start, radians. Each knuckler thrown starts somewhere new. */
  seam?: number
}

/** A knuckler's seam force: its strength and where the seams start. */
export interface KnuckleInput {
  c: number
  seam: number
}

/**
 * The seam-force coefficients at seam angle `phi`: sideways and up, from
 * C sin 4 phi on one axis and C sin 4 psi on the other. The second axis tumbles
 * at half the rate from its own start, an assumption: the model this follows
 * turns the ball about one axis at a time.
 */
export function knuckleCoefficients(c: number, phi: number, seam: number): [number, number] {
  const psi = seam * 2.3 + (phi - seam) * 0.5
  return [c * Math.sin(4 * phi), c * Math.sin(4 * psi)]
}

/** Integrator step, s. */
const DT = 0.002
/** Step cap: 5 s of flight, far past any lob. */
const MAX_STEPS = 2500
/** Drag and lift share this factor: 0.5 * rho * A / m. */
const AERO_K = (0.5 * AIR_DENSITY * BALL_AREA) / BALL_MASS

/** Lift coefficient for a spin factor S. */
export function liftCoefficient(spinFactor: number): number {
  return 1 / (2.32 + 0.4 / spinFactor)
}

/**
 * Acceleration of the ball at velocity `v` (m/s) with angular velocity `spin`
 * (rad/s, or null for no spin): gravity, drag against the motion, and Magnus
 * lift along spin x velocity.
 */
export function acceleration(v: Vec3, spin: Vec3 | null, knuckle?: { c: number; phi: number; seam: number }): Vec3 {
  const speed = length(v)
  const drag = AERO_K * DRAG_COEFFICIENT * speed
  const a: Vec3 = [-drag * v[0], -drag * v[1] - GRAVITY, -drag * v[2]]
  if (knuckle && knuckle.c > 0 && speed > 1e-6) {
    // Sideways is level and square to the flight; up is square to both.
    const dir = scale(v, 1 / speed)
    const side = normalize(cross([0, 1, 0], dir))
    const up = cross(dir, side)
    const [g, h] = knuckleCoefficients(knuckle.c, knuckle.phi, knuckle.seam)
    const k = AERO_K * speed * speed
    for (let i = 0; i < 3; i++) a[i] += k * (g * side[i] + h * up[i])
  }
  if (spin) {
    const lift = cross(spin, scale(v, 1 / speed))
    const wPerp = length(lift)
    if (wPerp > 1e-6) {
      const k = (AERO_K * liftCoefficient((BALL_RADIUS * wPerp) / speed) * speed * speed) / wPerp
      a[0] += k * lift[0]
      a[1] += k * lift[1]
      a[2] += k * lift[2]
    }
  }
  return a
}

/** The result of one integration from the release point to the ground. */
export interface Integration {
  /** Where the ball's centre is when its bottom touches the ground. */
  end: Vec3
  endVelocity: Vec3
  /** Flight time, s. */
  time: number
  /** Highest point the ball's centre reached, m. */
  apexHeight: number
  apexPoint: Vec3
  /** Sample times, filled only when sampling. */
  times: number[]
  /** Sample positions, flat xyz, filled only when sampling. */
  points: number[]
}

/**
 * Integrate a throw with initial velocity `v0` and constant spin vector from the
 * release point until the ball touches the ground (centre at one ball radius).
 * Midpoint (RK2) step for velocity, trapezoid for position; the final step is cut
 * back to land exactly on the ground.
 */
export function integrateToGround(v0: Vec3, spin: Vec3 | null, sample: boolean, knuckle?: KnuckleInput): Integration {
  let p: Vec3 = [RELEASE.x, RELEASE.y, RELEASE.z]
  let v: Vec3 = [...v0]
  let t = 0
  let apexHeight = p[1]
  let apexPoint: Vec3 = [...p]
  const times = [0]
  const points: number[] = [...p]

  // The seams turn with the ball: the angle runs at the spin rate from its start.
  const turn = spin ? length(spin) : 0
  const seamAt = (time: number) => (knuckle && knuckle.c > 0 ? { c: knuckle.c, phi: knuckle.seam + turn * time, seam: knuckle.seam } : undefined)

  for (let step = 0; step < MAX_STEPS; step++) {
    const a1 = acceleration(v, spin, seamAt(t))
    const a2 = acceleration([v[0] + a1[0] * DT * 0.5, v[1] + a1[1] * DT * 0.5, v[2] + a1[2] * DT * 0.5], spin, seamAt(t + DT * 0.5))
    const vNext: Vec3 = [v[0] + a2[0] * DT, v[1] + a2[1] * DT, v[2] + a2[2] * DT]
    const pNext: Vec3 = [
      p[0] + (v[0] + vNext[0]) * 0.5 * DT,
      p[1] + (v[1] + vNext[1]) * 0.5 * DT,
      p[2] + (v[2] + vNext[2]) * 0.5 * DT,
    ]
    if (vNext[1] < 0 && pNext[1] <= BALL_RADIUS) {
      // Cut the last step back to the instant the ball touches down.
      const f = (p[1] - BALL_RADIUS) / (p[1] - pNext[1])
      p = [p[0] + (pNext[0] - p[0]) * f, BALL_RADIUS, p[2] + (pNext[2] - p[2]) * f]
      v = [v[0] + (vNext[0] - v[0]) * f, v[1] + (vNext[1] - v[1]) * f, v[2] + (vNext[2] - v[2]) * f]
      t += DT * f
      if (sample) {
        times.push(t)
        points.push(...p)
      }
      break
    }
    p = pNext
    v = vNext
    t += DT
    if (p[1] > apexHeight) {
      apexHeight = p[1]
      apexPoint = [...p]
    }
    if (sample) {
      times.push(t)
      points.push(...p)
    }
  }
  return { end: p, endVelocity: v, time: t, apexHeight, apexPoint, times, points }
}

/**
 * The spin vector for a throw: backspin about the axis perpendicular to the
 * release direction and to a vertical tilted by `push` degrees, at `rpm`.
 * Null when the lob carries no spin.
 */
export function spinVector(v0: Vec3, params: Pick<LobParams, 'rpm' | 'push'>): Vec3 | null {
  if (params.rpm <= 0) return null
  const push = (params.push * Math.PI) / 180
  const axis = normalize(cross(normalize(v0), [Math.sin(push), Math.cos(push), 0]))
  return scale(axis, params.rpm * RPM)
}

/** Solve a 3x3 linear system by Gaussian elimination with partial pivoting. */
function solve3(m: number[][], rhs: number[]): Vec3 | null {
  const a = m.map((row, i) => [...row, rhs[i]])
  for (let col = 0; col < 3; col++) {
    let pivot = col
    for (let r = col + 1; r < 3; r++) if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r
    if (Math.abs(a[pivot][col]) < 1e-9) return null
    ;[a[col], a[pivot]] = [a[pivot], a[col]]
    for (let r = col + 1; r < 3; r++) {
      const f = a[r][col] / a[col][col]
      for (let c = col; c < 4; c++) a[r][c] -= f * a[col][c]
    }
  }
  const x: Vec3 = [0, 0, 0]
  for (let r = 2; r >= 0; r--) {
    let s = a[r][3]
    for (let c = r + 1; c < 3; c++) s -= a[r][c] * x[c]
    x[r] = s / a[r][r]
  }
  return x
}

/** A solved lob, sampled for drawing and for the batter and zone checks. */
export interface Flight {
  /** Number of samples. */
  count: number
  /** Sample times, s. */
  times: Float32Array
  /** Sample positions, flat xyz, metres. */
  positions: Float32Array
  /** Cumulative path length at each sample, metres. */
  distance: Float32Array
  /** Index of the highest sample. */
  apexIndex: number
  /** Flight time, s. */
  duration: number
  /** Unit spin axis ([1, 0, 0] when there is no spin). */
  spinAxis: Vec3
  /** Spin rate, rad/s. */
  spinRate: number
  /** Unit release direction. */
  releaseDirection: Vec3
  /** Release speed, mph. */
  releaseMph: number
  /** The highest point of the path, metres. */
  apex: Vec3
  /** Where the ball comes down, metres. */
  land: { x: number; z: number }
  /** Where the path crosses the plate's middle line (z = 0): x, height y, and
      the angle it is falling at, degrees below horizontal. */
  crossing: { x: number; y: number; angle: number }
  /** How far spin moved the landing spot along the pitch line, inches. */
  spinCarryIn: number
  /** How far spin moved the landing spot across the plate, inches. */
  spinDriftIn: number
  /** Where the throw was aimed to land: the asked-for spot, metres. A knuckler's
      seams take it somewhere else; every other pitch lands here. */
  aim: { x: number; z: number }
  /** True when the seams, not just spin, shaped this path. */
  knuckled: boolean
  /** The same throw with no spin and no seams, sampled flat xyz, metres: the
      path spin bent this one away from. */
  ghost: Float32Array
  /** False when no throw the solver found peaks and lands where asked; the
      path drawn is the closest it got. */
  converged: boolean
}

/**
 * Find the throw that peaks at `apex` ft and lands `land` in past the plate's
 * front edge, `side` in across, then sample its path. Newton's method on the
 * release velocity with a finite-difference Jacobian, starting from the
 * no-drag ballistic guess.
 */
export function solveLob(params: LobParams): Flight {
  const apexY = Math.max(params.apex * FT, RELEASE.y + 0.4)
  const landZ = PLATE.front + params.land * IN
  const landX = params.side * IN

  const vUp = Math.sqrt(2 * GRAVITY * (apexY - RELEASE.y))
  const tGuess = vUp / GRAVITY + Math.sqrt((2 * (apexY - BALL_RADIUS)) / GRAVITY)
  const v0: Vec3 = [(landX - RELEASE.x) / tGuess, vUp, (landZ - RELEASE.z) / tGuess]

  // The aim ignores the seams: nobody can aim a knuckler's dance.
  const miss = (v: Vec3): Vec3 => {
    const r = integrateToGround(v, spinVector(v, params), false)
    return [r.end[0] - landX, r.apexHeight - apexY, r.end[2] - landZ]
  }

  const TOLERANCE = 4e-4
  const worst = (f: Vec3) => Math.max(Math.abs(f[0]), Math.abs(f[1]), Math.abs(f[2]))
  let converged = false
  for (let iter = 0; iter < 12; iter++) {
    const f = miss(v0)
    if (worst(f) < TOLERANCE) {
      converged = true
      break
    }
    const jac: number[][] = [[], [], []]
    const h = 0.02
    for (let c = 0; c < 3; c++) {
      const probe: Vec3 = [...v0]
      probe[c] += h
      const fp = miss(probe)
      for (let r = 0; r < 3; r++) jac[r][c] = (fp[r] - f[r]) / h
    }
    const step = solve3(jac, [-f[0], -f[1], -f[2]])
    if (!step) break
    for (let c = 0; c < 3; c++) v0[c] += Math.max(-1.5, Math.min(1.5, step[c]))
  }
  // The last step may have landed it; anything still off by more than a few mm is a miss.
  if (!converged) converged = worst(miss(v0)) < 2 * TOLERANCE

  const spin = spinVector(v0, params)
  const knuckle = params.knuckle && params.knuckle > 0 ? { c: params.knuckle, seam: params.seam ?? 0 } : undefined
  const path = integrateToGround(v0, spin, true, knuckle)
  const still = integrateToGround(v0, null, true)

  const count = path.times.length
  const times = Float32Array.from(path.times)
  const positions = Float32Array.from(path.points)
  const distance = new Float32Array(count)
  for (let i = 1; i < count; i++) {
    distance[i] =
      distance[i - 1] +
      Math.hypot(
        positions[i * 3] - positions[i * 3 - 3],
        positions[i * 3 + 1] - positions[i * 3 - 2],
        positions[i * 3 + 2] - positions[i * 3 - 1],
      )
  }

  let apexIndex = 0
  for (let i = 1; i < count; i++) if (positions[i * 3 + 1] > positions[apexIndex * 3 + 1]) apexIndex = i

  // Where the path crosses z = 0, the line the plate's sides end on.
  const crossing = { x: 0, y: 0, angle: 0 }
  for (let i = 1; i < count; i++) {
    const z0 = positions[i * 3 - 1]
    const z1 = positions[i * 3 + 2]
    if (z0 <= 0 && z1 > 0) {
      const f = -z0 / (z1 - z0)
      crossing.x = positions[i * 3 - 3] + (positions[i * 3] - positions[i * 3 - 3]) * f
      crossing.y = positions[i * 3 - 2] + (positions[i * 3 + 1] - positions[i * 3 - 2]) * f
      crossing.angle = (Math.atan2(positions[i * 3 - 2] - positions[i * 3 + 1], z1 - z0) * 180) / Math.PI
      break
    }
  }

  return {
    count,
    times,
    positions,
    distance,
    apexIndex,
    duration: path.time,
    spinAxis: spin ? normalize(spin) : [1, 0, 0],
    spinRate: spin ? length(spin) : 0,
    releaseDirection: normalize(v0),
    releaseMph: length(v0) / MPH,
    apex: path.apexPoint,
    land: { x: path.end[0], z: path.end[2] },
    crossing,
    spinCarryIn: (path.end[2] - still.end[2]) / IN,
    spinDriftIn: (path.end[0] - still.end[0]) / IN,
    aim: { x: landX, z: landZ },
    knuckled: Boolean(knuckle),
    ghost: Float32Array.from(still.points),
    converged,
  }
}

/** Index pair [i, i + 1] bracketing time `t` in the samples. */
function bracketTime(flight: Flight, t: number): [number, number, number] {
  let lo = 0
  let hi = flight.count - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (flight.times[mid] <= t) lo = mid
    else hi = mid
  }
  const f = (t - flight.times[lo]) / (flight.times[hi] - flight.times[lo] || 1)
  return [lo, hi, f]
}

/** Ball position at time `t` (s), clamped to the release and the landing. */
export function positionAt(flight: Flight, t: number, out: Vec3 = [0, 0, 0]): Vec3 {
  const p = flight.positions
  if (t <= 0) {
    out[0] = p[0]
    out[1] = p[1]
    out[2] = p[2]
    return out
  }
  if (t >= flight.duration) {
    const last = (flight.count - 1) * 3
    out[0] = p[last]
    out[1] = p[last + 1]
    out[2] = p[last + 2]
    return out
  }
  const [lo, hi, f] = bracketTime(flight, t)
  for (let k = 0; k < 3; k++) out[k] = p[lo * 3 + k] + (p[hi * 3 + k] - p[lo * 3 + k]) * f
  return out
}

/** Fraction of the path length covered by time `t`, 0..1 (for drawing a trail). */
export function progressAt(flight: Flight, t: number): number {
  if (t <= 0) return 0
  if (t >= flight.duration) return 1
  const [lo, hi, f] = bracketTime(flight, t)
  const d = flight.distance
  return (d[lo] + (d[hi] - d[lo]) * f) / d[flight.count - 1]
}

/**
 * The falling ball's [x, height] where it reaches depth `z` on the way down.
 * Before the apex it reports the apex (the ball has not started falling yet);
 * past the landing spot it returns null.
 */
export function descentAtDepth(flight: Flight, z: number): [number, number] | null {
  const p = flight.positions
  const top = flight.apexIndex
  const last = flight.count - 1
  if (z < p[top * 3 + 2]) return [p[top * 3], p[top * 3 + 1]]
  if (z > p[last * 3 + 2]) return null
  let lo = top
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (p[mid * 3 + 2] <= z) lo = mid
    else hi = mid
  }
  const z0 = p[lo * 3 + 2]
  const f = (z - z0) / (p[hi * 3 + 2] - z0 || 1)
  return [p[lo * 3] + (p[hi * 3] - p[lo * 3]) * f, p[lo * 3 + 1] + (p[hi * 3 + 1] - p[lo * 3 + 1]) * f]
}

/** The depth z where the falling ball passes height `y`, or null when it never does. */
export function descentDepthAtHeight(flight: Flight, y: number): number | null {
  const p = flight.positions
  const top = flight.apexIndex
  const last = flight.count - 1
  if (y > p[top * 3 + 1] || y < p[last * 3 + 1]) return null
  let lo = top
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (p[mid * 3 + 1] >= y) lo = mid
    else hi = mid
  }
  const y0 = p[lo * 3 + 1]
  const f = (y0 - y) / (y0 - p[hi * 3 + 1] || 1)
  return p[lo * 3 + 2] + (p[hi * 3 + 2] - p[lo * 3 + 2]) * f
}
