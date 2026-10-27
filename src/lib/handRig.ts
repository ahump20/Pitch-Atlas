import { Matrix4, Quaternion, Vector3 } from 'three'
import { solveHand, type GripPoseContact } from './gripPose'
import { HAND_DEPTH, HAND_MESH, HAND_REST } from './handModel'

/*
  Poses a real hand on the ball.

  The hand is a rigged anatomical mesh (handModel.ts): wrist, metacarpals, three
  phalanges a finger and a thumb, the joints a hand-tracking headset reports. This
  solver bends those joints so each authored contact lands where gripPose puts it
  (same seam point, same finger direction), with the right part of the finger on
  the leather: the pad for a pad grip, the inside edge for an inside grip, the very
  end for a nail. Everything behind the contacts (where the wrist sits, how the
  free fingers curl, how far the palm stands off the cover) is solved, not
  authored: no claim hangs on it and nothing labels it.

  It is a least-squares fit. Contacts pull hard; the ball, the palm and the
  neighbouring fingers push back; joint limits clamp; a light preference for a
  relaxed curl settles whatever the contacts leave free. Right-handed throughout,
  like gripPose; a left hand is the mirror image, taken by the caller.
*/

/** A regulation ball is ~36.5mm in radius: the model is metric, the ball the unit sphere. */
export const HAND_SCALE = 1 / 0.0365

type Digit = GripPoseContact['finger']

const PARENT = [-1, 0, 1, 2, 3, 0, 5, 6, 7, 8, 0, 10, 11, 12, 13, 0, 15, 16, 17, 18, 0, 20, 21, 22, 23]
/** First joint of each digit: the thumb's metacarpal, a finger's metacarpal. */
export const DIGIT_ROOT: Record<Digit, number> = { thumb: 1, index: 5, middle: 10, ring: 15, pinky: 20 }
const LEAD = ['index', 'middle', 'ring', 'pinky'] as const
const distalOf = (d: Digit) => DIGIT_ROOT[d] + (d === 'thumb' ? 2 : 3)
/** The neighbour an "inside" contact faces: the ball sits between the two. */
const INSIDE_TOWARD: Record<Digit, Digit> = { thumb: 'index', index: 'middle', middle: 'index', ring: 'middle', pinky: 'ring' }

const DEG = Math.PI / 180
const S = HAND_SCALE
const restP = HAND_REST.map((r) => new Vector3(r[0], r[1], r[2]))
const restQ = HAND_REST.map((r) => new Quaternion(r[3], r[4], r[5], r[6]))
/** Each joint's offset and turn in its parent's rest frame, offsets in ball radii. */
const relP = restP.map((p, j) =>
  j ? p.clone().sub(restP[PARENT[j]]).applyQuaternion(restQ[PARENT[j]].clone().invert()).multiplyScalar(S) : new Vector3(),
)
const relQ = restQ.map((q, j) => (j ? restQ[PARENT[j]].clone().invert().multiply(q) : q.clone()))
/** Skin depth off a bone, in ball radii: 0 palmar, 1 back, 2 half-width, 3 reach. */
const depth = (j: number, k: number) => HAND_DEPTH[j][k] * S

/* Parameters: wrist translation and turn, the palm's arch, five per finger (knuckle
   bend, knuckle spread, middle joint, end joint, and the little roll a finger has
   at its knuckle), six for the thumb (its base turn as a rotation vector, its
   knuckle bend and spread, its end joint). */
const X_CUP = 6
const xFinger = (k: number) => 7 + 5 * k
const X_THUMB = 27
const N = 33
const LO = new Float64Array(N).fill(-Infinity)
const HI = new Float64Array(N).fill(Infinity)
LO[X_CUP] = 0
HI[X_CUP] = 24 * DEG
// a split grip spreads index and middle wide; the index and little finger range furthest
const SPREAD = [30, 20, 20, 30]
for (let k = 0; k < 4; k++) {
  const b = xFinger(k)
  ;[LO[b], HI[b]] = [-12 * DEG, 95 * DEG]
  ;[LO[b + 1], HI[b + 1]] = [-SPREAD[k] * DEG, SPREAD[k] * DEG]
  ;[LO[b + 2], HI[b + 2]] = [0, 110 * DEG]
  ;[LO[b + 3], HI[b + 3]] = [-5 * DEG, 85 * DEG]
  ;[LO[b + 4], HI[b + 4]] = [-15 * DEG, 15 * DEG]
}
for (let k = 0; k < 3; k++) [LO[X_THUMB + k], HI[X_THUMB + k]] = [-75 * DEG, 75 * DEG]
;[LO[X_THUMB + 3], HI[X_THUMB + 3]] = [-10 * DEG, 75 * DEG]
;[LO[X_THUMB + 4], HI[X_THUMB + 4]] = [-15 * DEG, 15 * DEG]
;[LO[X_THUMB + 5], HI[X_THUMB + 5]] = [-20 * DEG, 85 * DEG]

const AX = new Vector3(1, 0, 0)
const AY = new Vector3(0, 1, 0)
const AZ = new Vector3(0, 0, 1)
const scratchQ = new Quaternion()
const scratchQ2 = new Quaternion()
const scratchV = new Vector3()

function rotationVector(x: number, y: number, z: number, out: Quaternion): Quaternion {
  const a = Math.hypot(x, y, z)
  return a < 1e-12 ? out.identity() : out.setFromAxisAngle(scratchV.set(x / a, y / a, z / a), a)
}

/** The joint's own bend, applied in its rest frame. A finger flexes about its -x
    (-z runs down the bone, +y out of its back, so +x would straighten it back). */
function articulation(j: number, x: Float64Array, out: Quaternion): Quaternion {
  if (j === 15) return out.setFromAxisAngle(AX, -0.55 * x[X_CUP])
  if (j === 20) return out.setFromAxisAngle(AX, -x[X_CUP])
  if (j === 1) return rotationVector(x[X_THUMB], x[X_THUMB + 1], x[X_THUMB + 2], out)
  if (j === 2) return out.setFromAxisAngle(AY, x[X_THUMB + 4]).multiply(scratchQ2.setFromAxisAngle(AX, -x[X_THUMB + 3]))
  if (j === 3) return out.setFromAxisAngle(AX, -x[X_THUMB + 5])
  const k = (j - 5) / 5
  const step = j - 5 - 5 * Math.floor(k)
  if (j < 5 || step === 0 || step === 4) return out.identity()
  const b = xFinger(Math.floor(k))
  if (step === 1)
    return out
      .setFromAxisAngle(AY, x[b + 1])
      .multiply(scratchQ2.setFromAxisAngle(AX, -x[b]))
      .multiply(scratchQ2.setFromAxisAngle(AZ, x[b + 4]))
  return out.setFromAxisAngle(AX, -x[b + step])
}

export interface HandPose {
  /** Posed joints in ball space (the ball is the unit sphere), WebXR order. */
  position: Vector3[]
  quaternion: Quaternion[]
}

class Kinematics implements HandPose {
  position = Array.from({ length: 25 }, () => new Vector3())
  quaternion = Array.from({ length: 25 }, () => new Quaternion())
  constructor(
    readonly wristP: Vector3,
    readonly wristQ: Quaternion,
  ) {}

  run(x: Float64Array): this {
    const { position: p, quaternion: q } = this
    q[0].multiplyQuaternions(rotationVector(x[3], x[4], x[5], scratchQ), this.wristQ)
    p[0].set(this.wristP.x + x[0], this.wristP.y + x[1], this.wristP.z + x[2])
    for (let j = 1; j < 25; j++) {
      const parent = PARENT[j]
      p[j].copy(relP[j]).applyQuaternion(q[parent]).add(p[parent])
      q[j].multiplyQuaternions(q[parent], relQ[j]).multiply(articulation(j, x, scratchQ))
    }
    return this
  }

  /** A point given in joint j's own frame, in ball radii. */
  at(j: number, local: Vector3, out: Vector3): Vector3 {
    return out.copy(local).applyQuaternion(this.quaternion[j]).add(this.position[j])
  }
}

interface Grip {
  digit: Digit
  distal: number
  target: Vector3
  normal: Vector3
  /** Across the finger's authored direction: the distal bone should not point along it. */
  lateral: Vector3
  /** The touching skin, in the distal bone's frame: where it is and which way it faces. */
  pLocal: Vector3
  nLocal: Vector3
}

/** Which side of a digit faces its neighbour, as the sign of the distal bone's x. */
function insideSign(d: Digit): number {
  const j = distalOf(d)
  const toward = restP[DIGIT_ROOT[INSIDE_TOWARD[d]] + 1].clone().sub(restP[j])
  return Math.sign(toward.applyQuaternion(restQ[j].clone().invert()).x) || 1
}

function gripFor(c: GripPoseContact, contact: Vector3, dir: Vector3): Grip {
  const j = distalOf(c.finger)
  const tipAlong = restP[j + 1].distanceTo(restP[j]) * S
  const reach = depth(j, 3)
  const palmar = depth(j, 0)
  // how steeply the end of the finger meets the leather, and which skin touches it
  const curl = c.curl
  let along = tipAlong * 1.05
  let pitch = (8 + 22 * curl) * DEG
  let lateral = 0
  let drop = palmar
  if (c.engagement === 'inside') {
    along = tipAlong * 0.9
    pitch = (2 + 14 * curl) * DEG
    lateral = 40 * DEG
  } else if (c.engagement === 'tip') {
    along = reach * 0.85
    pitch = (35 + 20 * curl) * DEG
    drop = palmar * 0.7
  } else if (c.engagement === 'nail' || c.engagement === 'knuckle') {
    along = reach * 0.97
    pitch = (58 + 22 * curl) * DEG
    drop = 0
  }
  const side = insideSign(c.finger) * Math.sin(lateral)
  const pLocal = new Vector3(side * depth(j, 2), -drop * Math.cos(lateral), -along)
  const nLocal = new Vector3(side, -Math.cos(lateral) * Math.cos(pitch), -Math.cos(lateral) * Math.sin(pitch)).normalize()
  const normal = contact.clone().normalize()
  return {
    digit: c.finger,
    distal: j,
    target: normal.clone().multiplyScalar(1.004),
    normal,
    lateral: normal.clone().cross(dir).normalize(),
    pLocal,
    nLocal,
  }
}

/* Weights: contacts pull hardest, solid things push back nearly as hard, and the
   relaxed-hand preferences only settle what is left. */
const W = {
  contact: 60,
  facing: 10,
  heading: 3,
  ball: 30,
  palm: 20,
  neighbour: 10,
  couple: 1,
  spread: 0.8,
  restCurl: 0.5,
  heldCurl: 0.03,
  cup: 0.3,
  thumb: 0.15,
  circle: 1,
  drift: 0.02,
  turn: 0.08,
  behind: 20,
}

/** Starting rolls of the palm about its own back, and tips about the knuckle line (rad). */
const STARTS: [number, number][] = [
  [0, 0],
  [0.55, 0],
  [-0.55, 0],
  [0, 0.45],
  [0, -0.45],
]

/** A relaxed curl for a finger nothing holds on the ball: knuckle, middle, end. */
const REST_CURL = [55 * DEG, 75 * DEG, 45 * DEG]

function solve(contacts: readonly GripPoseContact[]) {
  const hand = solveHand([...contacts], { handedness: 'right' })
  const grips = contacts.map((c, i) => gripFor(c, toV(hand.fingers[i].contact), toV(hand.fingers[i].spineDir)))
  const held = new Set(grips.map((g) => g.digit))

  // Start the wrist from the specimen palm frame, set back to clear a real
  // hand's longer fingers; the fit moves it from there.
  const out = toV(hand.palm.out)
  const wrist = toV(hand.palm.wrist)
  const across = out.clone().cross(wrist).normalize()
  const knuckleRest = [6, 11, 16, 21].reduce((s, j) => s.add(restP[j]), new Vector3()).divideScalar(4)
  const a0 = restP[21].clone().sub(restP[6]).normalize()
  const w0 = restP[0].clone().sub(knuckleRest)
  w0.addScaledVector(a0, -w0.dot(a0)).normalize()
  const o0 = w0.clone().cross(a0)
  const toRest = new Matrix4().makeBasis(a0, w0, o0)
  const toGrip = new Matrix4().makeBasis(across, wrist, out)
  const wristQ = new Quaternion().setFromRotationMatrix(toGrip.multiply(toRest.transpose()))
  const knuckles = toV(hand.palm.origin).normalize().multiplyScalar(1.42).addScaledVector(wrist, 0.3)
  const wristP = restP[0].clone().sub(knuckleRest).multiplyScalar(S).applyQuaternion(wristQ).add(knuckles)

  const x = new Float64Array(N)
  x[X_CUP] = 8 * DEG
  LEAD.forEach((d, k) => {
    const b = xFinger(k)
    const curl = held.has(d) ? [35 * DEG, 45 * DEG, 30 * DEG] : REST_CURL
    ;[x[b], x[b + 2], x[b + 3]] = curl
  })
  x[X_THUMB + 3] = 20 * DEG
  x[X_THUMB + 5] = 20 * DEG

  // the fingers' side of the ball: a pitcher's wrist sits round behind it
  const front = grips
    .filter((g) => g.digit !== 'thumb')
    .reduce((s, g) => s.add(g.normal), new Vector3())
    .normalize()
  const BEHIND = Math.cos(115 * DEG)

  const kin = new Kinematics(wristP, wristQ)
  const thumbFree = !held.has('thumb')
  const circle = thumbFree && !held.has('index')
  const v1 = new Vector3()
  const v2 = new Vector3()
  const v3 = new Vector3()
  const tip = (d: Digit, out: Vector3) => kin.at(distalOf(d), v3.set(0, 0, -depth(distalOf(d), 3)), out)

  // the bones that must stay out of the ball, as (joint, next joint) with the skin depth facing it
  const bones: [number, number, number][] = []
  for (const d of ['thumb', ...LEAD] as Digit[]) {
    const r = DIGIT_ROOT[d]
    const first = d === 'thumb' ? r : r + 1
    for (let j = first; j < distalOf(d); j++) bones.push([j, j + 1, depth(j, 0)])
  }
  const palmPoints: [number, number, number][] = [
    [0, 0, depth(0, 0)],
    ...[5, 10, 15, 20].flatMap((j): [number, number, number][] => [
      [j, j + 1, depth(j, 0)],
      [j + 1, j + 1, depth(j + 1, 0)],
    ]),
    [1, 2, depth(1, 0)],
  ]

  const residual = (xs: Float64Array, r: Float64Array): number => {
    kin.run(xs)
    let i = 0
    const put = (value: number) => {
      r[i++] = value
    }
    for (const g of grips) {
      kin.at(g.distal, g.pLocal, v1).sub(g.target)
      put(W.contact * v1.x)
      put(W.contact * v1.y)
      put(W.contact * v1.z)
      v1.copy(g.nLocal).applyQuaternion(kin.quaternion[g.distal]).add(g.normal)
      put(W.facing * v1.x)
      put(W.facing * v1.y)
      put(W.facing * v1.z)
      v1.set(0, 0, -1).applyQuaternion(kin.quaternion[g.distal])
      put(W.heading * v1.dot(g.lateral))
    }
    // the ball: no bone sinks into the cover
    for (const [a, b, rad] of bones) {
      for (const t of [0.5, 1]) {
        v1.lerpVectors(kin.position[a], kin.position[b], t)
        put(W.ball * Math.max(0, 1 + rad - v1.length()))
      }
    }
    for (const d of ['thumb', ...LEAD] as Digit[]) {
      const j = distalOf(d)
      const holding = held.has(d)
      for (const t of [0.5, 1]) {
        v1.set(0, 0, -depth(j, 3) * t)
        kin.at(j, v1, v2)
        const rad = holding ? (t === 1 ? 0 : depth(j, 0) * 0.8) : depth(j, 0)
        put(W.ball * Math.max(0, 1 + rad - v2.length()))
      }
    }
    // the palm stands off the leather by its own thickness
    for (const [a, b, rad] of palmPoints) {
      v1.lerpVectors(kin.position[a], kin.position[b], 0.5)
      put(W.palm * Math.max(0, 1 + rad + 0.02 - v1.length()))
    }
    // neighbouring fingers lie beside each other, not through each other
    const pairs: [Digit, Digit][] = [
      ['index', 'middle'],
      ['middle', 'ring'],
      ['ring', 'pinky'],
      ['thumb', 'index'],
    ]
    for (const [d1, d2] of pairs) {
      const j1 = distalOf(d1)
      const j2 = distalOf(d2)
      const gap = depth(j1, 2) + depth(j2, 2)
      for (const p of [j1 - 1, j1, -1]) {
        if (p < 0) tip(d1, v1)
        else v1.copy(kin.position[p])
        for (const q of [j2 - 1, j2, -1]) {
          if (q < 0) tip(d2, v2)
          else v2.copy(kin.position[q])
          put(W.neighbour * Math.max(0, gap - v1.distanceTo(v2)))
        }
      }
    }
    // a relaxed hand: end joints follow the middle ones, fingers barely spread
    LEAD.forEach((d, k) => {
      const b = xFinger(k)
      put(W.couple * (xs[b + 3] - 0.75 * xs[b + 2]))
      put(W.spread * xs[b + 1])
      put(W.spread * xs[b + 4])
      const w = held.has(d) ? W.heldCurl : W.restCurl
      put(w * (xs[b] - REST_CURL[0]))
      put(w * (xs[b + 2] - REST_CURL[1]))
      put(w * (xs[b + 3] - REST_CURL[2]))
    })
    put(W.cup * (xs[X_CUP] - 10 * DEG))
    for (let k = 0; k < 6; k++) put(W.thumb * (thumbFree ? 3 : 1) * (xs[X_THUMB + k] - (k >= 3 && k !== 4 ? 25 * DEG : 0)))
    // a circle-change closes thumb and index into the circle it is named for
    if (circle) put(W.circle * (tip('thumb', v1).distanceTo(tip('index', v2)) - 0.42))
    else put(0)
    v1.copy(kin.position[0]).normalize()
    put(W.behind * Math.max(0, v1.dot(front) - BEHIND))
    for (let k = 0; k < 3; k++) put(W.drift * xs[k])
    for (let k = 3; k < 6; k++) put(W.turn * xs[k])
    let cost = 0
    for (let k = 0; k < i; k++) cost += r[k] * r[k]
    return cost
  }

  // The fit has local minima: a hand rolled the wrong way round its own palm can
  // put every fingertip on its spot with the wrong skin down. Start it from a few
  // rolls and tips of the palm and keep the best.
  const m = countResiduals(residual, x)
  let best = x
  let bestCost = Infinity
  for (const [roll, tip] of STARTS) {
    const trial = x.slice()
    const turn = out.clone().multiplyScalar(roll).addScaledVector(across, tip)
    ;[trial[3], trial[4], trial[5]] = [turn.x, turn.y, turn.z]
    const cost = levenbergMarquardt(trial, residual, m, 45)
    if (cost < bestCost) {
      best = trial
      bestCost = cost
    }
  }
  levenbergMarquardt(best, residual, m, 120)
  kin.run(best)
  return { kin, grips, x: best }
}

function countResiduals(residual: (x: Float64Array, r: Float64Array) => number, x: Float64Array): number {
  const probe = new Float64Array(2048).fill(Number.NaN)
  residual(x, probe)
  return probe.findIndex((v) => Number.isNaN(v))
}

function toV(p: { x: number; y: number; z: number }): Vector3 {
  return new Vector3(p.x, p.y, p.z)
}

/** Damped least squares with box limits on the joints. */
function levenbergMarquardt(
  x: Float64Array,
  residual: (x: Float64Array, r: Float64Array) => number,
  m: number,
  iterations: number,
): number {
  const n = x.length
  const r0 = new Float64Array(m)
  const r1 = new Float64Array(m)
  const jac = new Float64Array(m * n)
  const a = new Float64Array(n * n)
  const g = new Float64Array(n)
  const step = new Float64Array(n)
  const trial = new Float64Array(n)
  let cost = residual(x, r0)
  let lambda = 1e-2
  for (let it = 0; it < iterations; it++) {
    for (let k = 0; k < n; k++) {
      const keep = x[k]
      const h = 1e-6
      x[k] = keep + h
      residual(x, r1)
      x[k] = keep
      for (let i = 0; i < m; i++) jac[i * n + k] = (r1[i] - r0[i]) / h
    }
    a.fill(0)
    g.fill(0)
    for (let i = 0; i < m; i++) {
      const row = i * n
      const ri = r0[i]
      for (let p = 0; p < n; p++) {
        const jp = jac[row + p]
        if (jp === 0) continue
        g[p] += jp * ri
        for (let q = p; q < n; q++) a[p * n + q] += jp * jac[row + q]
      }
    }
    let moved = false
    for (let attempt = 0; attempt < 10; attempt++) {
      if (!choleskySolve(a, g, lambda, step, n)) {
        lambda *= 10
        continue
      }
      for (let k = 0; k < n; k++) trial[k] = Math.min(HI[k], Math.max(LO[k], x[k] - step[k]))
      const next = residual(trial, r1)
      if (next < cost) {
        const gain = (cost - next) / cost
        x.set(trial)
        r0.set(r1)
        cost = next
        lambda = Math.max(lambda / 3, 1e-9)
        moved = gain > 1e-7
        break
      }
      lambda *= 4
    }
    if (!moved) break
  }
  return cost
}

/** Solves (A + lambda * diag(A)) s = g for the upper triangle of A; false if not positive. */
function choleskySolve(a: Float64Array, g: Float64Array, lambda: number, s: Float64Array, n: number): boolean {
  const l = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = j === i ? a[j * n + i] * (1 + lambda) + 1e-9 : a[j * n + i]
      for (let k = 0; k < j; k++) sum -= l[i * n + k] * l[j * n + k]
      if (i === j) {
        if (sum <= 0) return false
        l[i * n + i] = Math.sqrt(sum)
      } else l[i * n + j] = sum / l[j * n + j]
    }
  }
  for (let i = 0; i < n; i++) {
    let sum = g[i]
    for (let k = 0; k < i; k++) sum -= l[i * n + k] * s[k]
    s[i] = sum / l[i * n + i]
  }
  for (let i = n - 1; i >= 0; i--) {
    let sum = s[i]
    for (let k = i + 1; k < n; k++) sum -= l[k * n + i] * s[k]
    s[i] = sum / l[i * n + i]
  }
  return true
}

export interface RiggedHand extends HandPose {
  /** Per authored contact, in contact order: the authored point on the leather and
      its outward normal, the skin point the fit put there, and the finger's line
      from fingertip back to knuckle. */
  contacts: {
    digit: Digit
    contact: Vector3
    normal: Vector3
    pad: Vector3
    line: Vector3[]
    /** How far the touching skin landed from the contact, in ball radii. */
    miss: number
    /** How far, in degrees, that skin turns from facing straight into the leather. */
    tilt: number
  }[]
  /** The digits no contact names, fingertip to knuckle: solid, never labelled. */
  free: Vector3[][]
}

/** The digit's line from the end of its fingertip back to its root knuckle. */
function digitLine(pose: Kinematics, d: Digit): Vector3[] {
  const j = distalOf(d)
  const end = pose.at(j, new Vector3(0, 0, -depth(j, 3)), new Vector3())
  const root = d === 'thumb' ? DIGIT_ROOT.thumb + 1 : DIGIT_ROOT[d] + 1
  const line = [end]
  for (let k = j; k >= root; k--) line.push(pose.position[k].clone())
  return line
}

const fitted = new WeakMap<readonly GripPoseContact[], RiggedHand>()

/** Fit the hand to a pitch's authored contacts (right-handed). A pitch's contacts
    are fixed data, so each fit is kept for the next time that pitch is shown. */
export function rigHand(contacts: readonly GripPoseContact[]): RiggedHand {
  const known = fitted.get(contacts)
  if (known) return known
  const hand = fit(contacts)
  fitted.set(contacts, hand)
  return hand
}

function fit(contacts: readonly GripPoseContact[]): RiggedHand {
  const { kin, grips } = solve(contacts)
  const held = new Set(grips.map((g) => g.digit))
  return {
    position: kin.position.map((p) => p.clone()),
    quaternion: kin.quaternion.map((q) => q.clone()),
    contacts: grips.map((g) => {
      const pad = kin.at(g.distal, g.pLocal, new Vector3())
      const facing = g.nLocal.clone().applyQuaternion(kin.quaternion[g.distal])
      return {
        digit: g.digit,
        contact: g.normal.clone(),
        normal: g.normal.clone(),
        pad,
        line: digitLine(kin, g.digit),
        miss: pad.distanceTo(g.target),
        tilt: Math.acos(Math.min(1, -facing.dot(g.normal))) / DEG,
      }
    }),
    free: (['thumb', ...LEAD] as Digit[]).filter((d) => !held.has(d)).map((d) => digitLine(kin, d)),
  }
}

function decode(base64: string): ArrayBuffer {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

const mesh = {
  positions: new Float32Array(decode(HAND_MESH.positions)),
  indices: new Uint16Array(decode(HAND_MESH.indices)),
  joints: new Uint8Array(decode(HAND_MESH.joints)),
  weights: new Uint8Array(decode(HAND_MESH.weights)),
}

export const HAND_INDICES = mesh.indices

/** How much of each vertex each digit moves, 0..1: thumb, index, middle, ring, pinky. */
export const DIGIT_WEIGHTS: Float32Array = (() => {
  const out = new Float32Array(HAND_MESH.vertexCount * 5)
  for (let v = 0; v < HAND_MESH.vertexCount; v++) {
    for (let k = 0; k < 4; k++) {
      const j = mesh.joints[v * 4 + k]
      const w = mesh.weights[v * 4 + k] / 255
      // a digit's own bones, past its metacarpal (the thumb's metacarpal is its own)
      if (j === 0 || (j >= 5 && (j - 5) % 5 === 0)) continue
      const digit = j < 5 ? 0 : 1 + Math.floor((j - 5) / 5)
      out[v * 5 + digit] += w
    }
  }
  return out
})()

/** Skin tone cues per vertex, 0..1: fingertip flush (the end bones), palm side
    (the rest hand's palm faces -x, fingers included), and nail: the back of each
    end bone from about halfway along to the tip, measured in that bone's frame. */
export const HAND_TONE: Float32Array = (() => {
  const { positions: p, indices } = mesh
  const normal = new Float32Array(p.length)
  const e1 = new Vector3()
  const e2 = new Vector3()
  const a = new Vector3()
  for (let t = 0; t < indices.length; t += 3) {
    const [i, j, k] = [indices[t], indices[t + 1], indices[t + 2]]
    a.fromArray(p, i * 3)
    e1.fromArray(p, j * 3).sub(a)
    e2.fromArray(p, k * 3).sub(a)
    e1.cross(e2)
    for (const v of [i, j, k]) {
      normal[v * 3] += e1.x
      normal[v * 3 + 1] += e1.y
      normal[v * 3 + 2] += e1.z
    }
  }
  const ramp = (lo: number, hi: number, t: number) => {
    const u = Math.min(1, Math.max(0, (t - lo) / (hi - lo)))
    return u * u * (3 - 2 * u)
  }
  const local = new Vector3()
  const out = new Float32Array(HAND_MESH.vertexCount * 3)
  for (let v = 0; v < HAND_MESH.vertexCount; v++) {
    let flush = 0
    let end = -1
    for (let k = 0; k < 4; k++) {
      const j = mesh.joints[v * 4 + k]
      const w = mesh.weights[v * 4 + k] / 255
      if (j === 3 || (j >= 8 && (j - 8) % 5 === 0)) {
        flush += w
        if (w > 0.3) end = j
      }
    }
    const len = Math.hypot(normal[v * 3], normal[v * 3 + 1], normal[v * 3 + 2]) || 1
    out[v * 3] = flush
    out[v * 3 + 1] = Math.max(0, -normal[v * 3] / len)
    if (end < 0) continue
    local.fromArray(p, v * 3).sub(restP[end]).applyQuaternion(restQ[end].clone().invert())
    const [, back, half, reach] = HAND_DEPTH[end]
    const along = -local.z / reach
    out[v * 3 + 2] =
      ramp(0.4, 0.5, along) * (1 - ramp(0.66, 0.8, Math.abs(local.x) / half)) * ramp(0.2, 0.45, local.y / back)
  }
  return out
})()

/** The mesh bent to a pose (linear blend skinning), in ball space. */
export function skinHand(pose: HandPose): Float32Array {
  const bind = HAND_REST.map((_, j) => {
    const unbind = new Matrix4().compose(restP[j], restQ[j], new Vector3(1, 1, 1)).invert()
    return new Matrix4()
      .compose(pose.position[j], pose.quaternion[j], new Vector3(S, S, S))
      .multiply(unbind).elements
  })
  const out = new Float32Array(HAND_MESH.vertexCount * 3)
  const { positions: p, joints, weights } = mesh
  for (let v = 0; v < HAND_MESH.vertexCount; v++) {
    const x = p[v * 3]
    const y = p[v * 3 + 1]
    const z = p[v * 3 + 2]
    let ox = 0
    let oy = 0
    let oz = 0
    for (let k = 0; k < 4; k++) {
      const w = weights[v * 4 + k] / 255
      if (!w) continue
      const e = bind[joints[v * 4 + k]]
      ox += w * (e[0] * x + e[4] * y + e[8] * z + e[12])
      oy += w * (e[1] * x + e[5] * y + e[9] * z + e[13])
      oz += w * (e[2] * x + e[6] * y + e[10] * z + e[14])
    }
    out[v * 3] = ox
    out[v * 3 + 1] = oy
    out[v * 3 + 2] = oz
  }
  return out
}
