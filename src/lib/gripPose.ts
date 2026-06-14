import { seamRaw, v, SEAM_VIEW_TILT, type Vec3 } from './seam'
import type {
  FingerEngagement,
  GripContactModel,
  Handedness,
  PressureTier,
  SeamAnchoredPoint,
} from '../data/types'

/*
  The grip-pose solver. Pure math, no rendering imports.

  One authored contact (seamT + seamOffset + azimuth + engagement + curl) maps to
  one finger spine: a polyline of points on and over the ball surface, tip first.
  The 3D hand sweeps a tube along it; the 2D schematic projects the same points;
  the tests interrogate it directly. All three read this one function, so the
  model, the fallback, and the acceptance constraints can never disagree.

  Conventions (shared with the seam library):
   - the ball is the unit sphere; distances are in ball radii, which on the unit
     sphere are also radians of surface arc.
   - seamOffset is signed surface arc perpendicular to the seam path: 0 = the
     spine sits on the seam, positive = toward the open leather outside the seam
     lanes, negative = across the seam (the cutter's off-center shift).
   - azimuth is the finger-spine direction relative to the seam tangent, in
     degrees: 0 rides along the seam like a rail, +/-90 crosses it square.
   - handedness 'left' mirrors x, matching the ball renderer's mirror.
*/

export type GripPoseContact = Pick<
  GripContactModel,
  'finger' | 'seamT' | 'lift' | 'seamOffset' | 'azimuth' | 'engagement' | 'curl'
> & { pressureTier?: PressureTier }

export interface FingerSpine {
  finger: SeamAnchoredPoint['finger']
  /** Centerline of the finger, fingertip first, on/over the ball surface. */
  points: Vec3[]
  /** Tube radius at each point (tip tapered, base full). */
  radii: number[]
  /** The authored contact point on the leather. */
  contact: Vec3
  /** Outward surface normal at the contact. */
  contactNormal: Vec3
  /** Direction the finger points (base toward tip), tangent to the surface at the contact. */
  spineDir: Vec3
  /** Surface arc the finger actually hugs before lifting. Depth, made measurable:
      an 'inside' (wedged-deep) engagement hugs more leather than a fingertip. */
  contactArc: number
}

/** How each engagement meets the leather. Hug = how long the finger stays on the
    surface; lift = how proud of the leather the contact itself sits (a nail or a
    knuckle holds the flesh off the ball); overhang = how far the tip reaches past
    the authored contact point. */
const ENGAGEMENT: Record<
  FingerEngagement,
  { hug: number; contactLift: number; liftRate: number; tipOverhang: number }
> = {
  tip: { hug: 0.12, contactLift: 0.006, liftRate: 1.3, tipOverhang: 0.04 },
  pad: { hug: 0.3, contactLift: 0.004, liftRate: 0.95, tipOverhang: 0.12 },
  inside: { hug: 0.58, contactLift: 0.003, liftRate: 0.55, tipOverhang: 0.18 },
  nail: { hug: 0.06, contactLift: 0.04, liftRate: 1.6, tipOverhang: 0.01 },
  knuckle: { hug: 0.09, contactLift: 0.055, liftRate: 1.7, tipOverhang: -0.03 },
}

/** Rendered finger proportions, in ball radii. A specimen hand, not anatomy. */
const FINGER: Record<
  SeamAnchoredPoint['finger'],
  { length: number; radius: number }
> = {
  thumb: { length: 1.05, radius: 0.155 },
  index: { length: 1.42, radius: 0.125 },
  middle: { length: 1.55, radius: 0.13 },
  ring: { length: 1.38, radius: 0.12 },
  pinky: { length: 1.08, radius: 0.1 },
}

const PRESSURE_RADIUS: Record<PressureTier, number> = {
  primary: 1.1,
  support: 1.0,
  light: 0.92,
}

const DEG = Math.PI / 180

/** Seam tangent at parameter t (radians), from the analytic curve, projected to
    the sphere's tangent plane at the normalized seam point. */
function seamTangent(t: number): Vec3 {
  const e = 1e-4
  const a = v.normalize(seamRaw(t - e))
  const b = v.normalize(seamRaw(t + e))
  const p = v.normalize(seamRaw(t))
  const d = v.sub(b, a)
  // project onto the tangent plane at p, then normalize
  const radial = v.scale(p, v.dot(d, p))
  return v.normalize(v.sub(d, radial))
}

/** Walk from a unit-sphere point along a unit tangent direction by `arc` radians. */
function surfaceWalk(p: Vec3, dir: Vec3, arc: number): Vec3 {
  return v.normalize(v.add(v.scale(p, Math.cos(arc)), v.scale(dir, Math.sin(arc))))
}

/** Project a direction onto the tangent plane at a unit-sphere point. */
function tangentialize(dir: Vec3, at: Vec3): Vec3 {
  const radial = v.scale(at, v.dot(dir, at))
  return v.normalize(v.sub(dir, radial))
}

export interface SolveOptions {
  handedness?: Handedness
  /** Sample count along the spine. */
  samples?: number
}

/**
 * Map one authored contact to a finger spine.
 *
 * The contact point starts on the seam at seamT, is displaced perpendicular to
 * the seam path by seamOffset (surface arc), and the finger spine is laid
 * through it at `azimuth` degrees off the seam tangent. The spine hugs the
 * leather for the engagement's contact arc (stretched by curl — a wrapped
 * finger hugs longer), then lifts away quadratically (a straighter finger
 * leaves faster). Everything is deterministic from the authored fields.
 */
export function solveGripPose(contact: GripPoseContact, opts: SolveOptions = {}): FingerSpine {
  const handedness = opts.handedness ?? 'right'
  const samples = Math.max(8, opts.samples ?? 26)
  const eng = ENGAGEMENT[contact.engagement]
  const fin = FINGER[contact.finger]

  const t = contact.seamT * Math.PI * 2
  const onSeam = v.normalize(seamRaw(t))
  const tangent = seamTangent(t)
  const across = v.normalize(v.cross(onSeam, tangent))

  // displace perpendicular to the seam path along the surface
  const contactPoint = surfaceWalk(onSeam, across, contact.seamOffset)
  const normal = contactPoint
  const tangentAtContact = tangentialize(tangent, contactPoint)

  // the finger spine direction: seam tangent swung by azimuth about the normal
  const spineDir = v.normalize(
    v.rotateAxis(tangentAtContact, normal, contact.azimuth * DEG),
  )

  const hugArc = eng.hug * (0.7 + 0.6 * contact.curl)
  const baseLift = eng.contactLift + contact.lift
  const liftSlope = eng.liftRate * (1.15 - 0.7 * contact.curl)

  const sTip = eng.tipOverhang
  const length = fin.length

  const points: Vec3[] = []
  const radii: number[] = []
  for (let i = 0; i < samples; i++) {
    const u = i / (samples - 1) // 0 = fingertip, 1 = finger base
    const s = sTip - u * length // signed surface arc along spineDir from the contact
    const onSurface = surfaceWalk(contactPoint, spineDir, s)
    // how far behind the hug zone this sample sits, in surface arc
    const behind = Math.max(0, -s - hugArc)
    const lift = baseLift + liftSlope * behind * behind
    points.push(v.scale(onSurface, 1 + lift))
    // taper toward the tip; full width through the shaft
    const taper = u < 0.16 ? 0.62 + (0.38 * u) / 0.16 : 1
    radii.push(fin.radius * taper * PRESSURE_RADIUS[contact.pressureTier ?? 'support'])
  }

  let outPoints = points
  let outContact = contactPoint
  let outNormal = normal
  let outDir = spineDir
  if (handedness === 'left') {
    const mx = (p: Vec3): Vec3 => ({ x: -p.x, y: p.y, z: p.z })
    outPoints = points.map(mx)
    outContact = mx(contactPoint)
    outNormal = mx(normal)
    outDir = mx(spineDir)
  }

  return {
    finger: contact.finger,
    points: outPoints,
    radii,
    contact: outContact,
    contactNormal: outNormal,
    spineDir: outDir,
    contactArc: hugArc,
  }
}

/* ── 2D projection, for the schematic fallback ──────────────────────────────
   The same presentation tilt the seam schematic applies, then an orthographic
   drop of z. Front/back flags let the renderer dim what sits behind the ball. */

export interface ProjectedSpine {
  finger: SeamAnchoredPoint['finger']
  /** Projected centerline, fingertip first, in schematic px. */
  points: { x: number; y: number; front: boolean }[]
  /** Projected contact point. */
  contact: { x: number; y: number; front: boolean }
  /** Stroke width for the silhouette, in schematic px. */
  strokeWidth: number
}

export function projectSpine(
  spine: FingerSpine,
  cx: number,
  cy: number,
  r: number,
): ProjectedSpine {
  const rot = (p: Vec3) => v.rotateAxis(p, SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
  const place = (p: Vec3) => {
    const q = rot(p)
    return { x: cx + q.x * r, y: cy - q.y * r, front: q.z >= 0 }
  }
  const meanRadius =
    spine.radii.reduce((a, b) => a + b, 0) / Math.max(1, spine.radii.length)
  return {
    finger: spine.finger,
    points: spine.points.map(place),
    contact: place(spine.contact),
    strokeWidth: meanRadius * 2 * r,
  }
}
