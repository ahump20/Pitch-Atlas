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

/* ── The hand ───────────────────────────────────────────────────────────────

  solveGripPose answers one question: where does this finger meet the leather.
  It answers it per contact, independently — which is why the render came out as
  loose tubes. Each spine walked a full finger length across the surface from its
  own contact, so a splitter's index and middle ended up nearly three ball radii
  apart with nothing behind them. Fingers do not do that. They converge on
  knuckles, and the knuckles sit on a palm.

  solveHand leaves every authored contact exactly where solveGripPose puts it —
  same seam point, same azimuth, same hug arc — and changes only what happens
  behind the contact: the finger lifts off the leather and reaches back to its
  knuckle on a shared palm. The palm frame is derived from the contacts
  themselves (where the fingers point, which way the wrist lies), so the hand
  turns with the grip instead of being posed by hand for each pitch.

  What is authored and what is rendered:
   - contact, engagement, pressure tier, cue — authored and sourced; every label
     on screen comes from one of these.
   - palm, knuckles, and the fingers not touching the ball — rendered
     proportions, exactly the status of the finger lengths above: a specimen
     hand, not an athlete scan. No claim hangs on them and none is labeled.
*/

/** Rendered hand proportions, in ball radii. A regulation ball is ~36.5mm in
    radius, so the 0.44 between knuckles is ~16mm and the palm spans about one
    ball diameter — an adult hand is a little wider than the ball it holds,
    which is the whole reason the fingers converge behind it. */
const HAND = {
  knuckleSpacing: 0.44,
  /** How far around the cover, in surface arc, the knuckle line sits behind the
      contacts. The hand wraps the ball. It does not hover over it — that was the
      first attempt, and it read as a plate on a lid. */
  knuckleArc: 0.95,
  /** Daylight between the leather and the knuckle line: the palm-gap cue, in
      geometry. */
  palmLift: 0.32,
  /** The knuckle is where a finger roots, not a bead sitting on the hand. Drawn
      as beads it read as four beans floating off the back; the finger's own
      swell into the mass carries it instead. */
  knuckleSwell: 0.86,
  /** The thumb leaves from inside the mass, not off its edge — rooted at the
      edge it read as a banana lying beside the hand. */
  thumbRootAcross: -0.6,
  thumbRootDown: 0.55,
  /** Nothing the hand renders may sink into the cover. */
  clearance: 0.004,
}

/** The palm's cross-sections, knuckle end first: distance wristward, half-width,
    half-thickness, and how far the section cups back toward the leather. A hand
    is a flattened, tapering mass that curls in at the heel — not a slab, which
    is what an extruded outline gave, and not a flap, which is what a flat one
    gave. The 3D loft and the 2D silhouette both read this one profile. */
const PALM_SECTIONS: [number, number, number, number][] = [
  [-0.16, 0.74, 0.2, 0.02],
  [0.06, 0.8, 0.26, 0],
  [0.36, 0.8, 0.31, -0.06],
  [0.64, 0.76, 0.32, -0.15],
  [0.86, 0.66, 0.27, -0.25],
  [1.02, 0.44, 0.17, -0.36],
]

const LEAD_ORDER = ['index', 'middle', 'ring', 'pinky'] as const
type LeadFinger = (typeof LEAD_ORDER)[number]

export interface HandKnuckle {
  finger: LeadFinger
  position: Vec3
  radius: number
  /** False when no authored contact uses this finger — it carries a curled
      finger, never a label. */
  engaged: boolean
}

export interface PalmSection {
  /** Distance wristward of the knuckle line. */
  y: number
  halfWidth: number
  halfThickness: number
  /** Signed offset along the palm's out axis — negative cups toward the ball. */
  cup: number
}

export interface PalmFrame {
  /** Center of the knuckle line, the origin of the palm's own frame. */
  origin: Vec3
  /** Orthonormal frame: across the knuckles (index → pinky), wristward along the
      back of the hand, and out through the back. */
  across: Vec3
  wrist: Vec3
  out: Vec3
  sections: PalmSection[]
  /** The silhouette of those sections in world space — down one side from the
      knuckles to the heel and back up the other. The 2D schematic reads it, so
      the flat draw and the model can never show a different hand. */
  outline: Vec3[]
}

export interface HandSolution {
  /** The authored contacts, tip first, now rooted on the palm. */
  fingers: FingerSpine[]
  /** All four, engaged or not: the palm spans the full hand either way, and the
      unengaged ones are read as closed inside that silhouette rather than drawn
      as loose curled digits — drawn, they were the one part of this render that
      could not be made to stop looking like a claw. */
  knuckles: HandKnuckle[]
  palm: PalmFrame
  /** Where the thumb leaves the hand, when a thumb contact is authored. */
  thumbRoot?: Vec3
}

const mirrorX = (p: Vec3): Vec3 => ({ x: -p.x, y: p.y, z: p.z })

/** Quadratic Bezier sample. */
function bezier(a: Vec3, c: Vec3, b: Vec3, u: number): Vec3 {
  const iu = 1 - u
  return {
    x: iu * iu * a.x + 2 * iu * u * c.x + u * u * b.x,
    y: iu * iu * a.y + 2 * iu * u * c.y + u * u * b.y,
    z: iu * iu * a.z + 2 * iu * u * c.z + u * u * b.z,
  }
}

/** Hold a point out at a radius. Pushing a chord's samples out to the cover is
    what turns the thumb's straight run under the ball into a wrap. */
function liftTo(p: Vec3, floor: number): Vec3 {
  const len = v.length(p)
  return len >= floor ? p : v.scale(v.normalize(p), floor)
}

/**
 * Solve a whole hand from a pitch's authored contacts.
 *
 * The contacts are solved individually first, so the leather side of the grip is
 * untouched. A palm frame is then fitted to them — walked around the cover from
 * the contacts, not floated above them — and each finger is re-laid from its
 * knuckle down to its contact.
 */
export function solveHand(
  contacts: GripPoseContact[],
  opts: SolveOptions = {},
): HandSolution {
  const handedness = opts.handedness ?? 'right'
  const samples = Math.max(10, opts.samples ?? 24)

  // Solve every contact right-handed; the whole hand mirrors at the end, so the
  // palm frame can never disagree with the fingers about which way is which.
  const solved = contacts.map((c) => ({ c, spine: solveGripPose(c, { handedness: 'right', samples }) }))
  const lead = solved.filter((s) => s.c.finger !== 'thumb')
  const anchor = lead.length > 0 ? lead : solved

  // Where the fingers sit on the cover, and which way they point.
  const contactCenter = v.normalize(
    anchor.reduce((acc, s) => v.add(acc, s.spine.contact), { x: 0, y: 0, z: 0 }),
  )
  const pointing = anchor.reduce((acc, s) => v.add(acc, s.spine.spineDir), { x: 0, y: 0, z: 0 })
  const tipward =
    v.length(pointing) > 1e-6
      ? tangentialize(pointing, contactCenter)
      : tangentialize(
          Math.abs(contactCenter.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 },
          contactCenter,
        )

  // Walk backwards around the ball from the contacts: that is where the knuckles
  // are, and the palm carries on tangentially from there, off the cover.
  const knuckleUnit = surfaceWalk(contactCenter, v.scale(tipward, -1), HAND.knuckleArc)
  const origin = v.scale(knuckleUnit, 1 + HAND.palmLift)
  const out = knuckleUnit
  const wrist = tangentialize(v.scale(tipward, -1), knuckleUnit)

  // across: index → pinky. Which way that runs depends on the pitch, so read it
  // off the contacts rather than guessing — if the authored fingers land in
  // descending order along the axis, the axis is backwards.
  let across = v.normalize(v.cross(wrist, out))
  const ranked = lead
    .map((s) => ({ idx: LEAD_ORDER.indexOf(s.c.finger as LeadFinger), proj: v.dot(s.spine.contact, across) }))
    .filter((r) => r.idx >= 0)
  if (ranked.length > 1) {
    const meanIdx = ranked.reduce((a, r) => a + r.idx, 0) / ranked.length
    const meanProj = ranked.reduce((a, r) => a + r.proj, 0) / ranked.length
    const slope = ranked.reduce((a, r) => a + (r.idx - meanIdx) * (r.proj - meanProj), 0)
    if (slope < 0) across = v.scale(across, -1)
  }

  const toWorld = (x: number, y: number, z = 0): Vec3 =>
    v.add(
      v.add(v.add(origin, v.scale(across, x)), v.scale(wrist, y)),
      v.scale(out, z),
    )

  const engagedFingers = new Set(lead.map((s) => s.c.finger))
  const knuckles: HandKnuckle[] = LEAD_ORDER.map((finger, i) => ({
    finger,
    position: toWorld((i - 1.5) * HAND.knuckleSpacing, 0),
    radius: FINGER[finger].radius * HAND.knuckleSwell,
    engaged: engagedFingers.has(finger),
  }))

  const thumbRoot = toWorld(HAND.thumbRootAcross, HAND.thumbRootDown, -0.06)

  /** Re-lay one solved contact so it reaches back to a root on the palm. The
      leather end is untouched: the tip, the contact, and the hug arc all stay
      exactly where solveGripPose put them. */
  const layFinger = (c: GripPoseContact, spine: FingerSpine, root: Vec3): FingerSpine => {
    const eng = ENGAGEMENT[c.engagement]
    const height = 1 + eng.contactLift + c.lift
    const hugArc = spine.contactArc
    const shaft = FINGER[c.finger].radius * PRESSURE_RADIUS[c.pressureTier ?? 'support']

    const hugCount = Math.max(4, Math.round(samples * 0.34))
    const reachCount = samples - hugCount
    const points: Vec3[] = []
    const radii: number[] = []

    // 1. the leather: overhang tip, through the contact, back along the hug arc.
    //    The centerline rides its own radius above the cover, less a little for
    //    the flesh giving — a spine laid flat on the surface buries most of the
    //    swept tube in the ball, and the cover then cuts the finger open along
    //    its silhouette.
    for (let i = 0; i < hugCount; i++) {
      const u = i / (hugCount - 1)
      const s = eng.tipOverhang - u * hugArc
      const taper = u < 0.34 ? 0.62 + (0.38 * u) / 0.34 : 1
      const r = shaft * taper
      points.push(v.scale(surfaceWalk(spine.contact, spine.spineDir, s), height + r * 0.72))
      radii.push(r)
    }

    // 2. the reach: off the leather and back to the knuckle. The control point
    //    leaves along the finger's own direction so it peels off the cover
    //    instead of kinking, and bows out a little — a curled finger bows more.
    //    The thumb's run under the ball is a chord through the leather, so its
    //    samples ride out onto the cover and it wraps, which is what a thumb
    //    does.
    const hugEnd = points[points.length - 1]
    const span = v.sub(root, hugEnd)
    const reachLen = v.length(span)
    const bow = 0.1 + 0.3 * c.curl
    const control = v.add(
      v.add(hugEnd, v.scale(spine.spineDir, -reachLen * 0.4)),
      v.scale(v.normalize(hugEnd), bow),
    )
    // the thumb thickens into the thenar over its run; a finger only swells a
    // little into its knuckle
    const rootSwell = c.finger === 'thumb' ? 0.34 : 0.32
    const floor = 1 + HAND.clearance + shaft * 0.86
    for (let i = 1; i <= reachCount; i++) {
      const u = i / reachCount
      const raw = bezier(hugEnd, control, root, u)
      // let the last stretch arrive at the knuckle instead of being held out
      points.push(u > 0.82 ? raw : liftTo(raw, floor))
      radii.push(shaft * (1 + rootSwell * u * u))
    }

    return { ...spine, points, radii }
  }

  const fingers = solved.map(({ c, spine }) => {
    const idx = LEAD_ORDER.indexOf(c.finger as LeadFinger)
    return layFinger(c, spine, idx >= 0 ? knuckles[idx].position : thumbRoot)
  })

  const sections: PalmSection[] = PALM_SECTIONS.map(([y, halfWidth, halfThickness, cup]) => ({
    y,
    halfWidth,
    halfThickness,
    cup,
  }))
  const palm: PalmFrame = {
    origin,
    across,
    wrist,
    out,
    sections,
    outline: [
      ...sections.map((s) => toWorld(s.halfWidth, s.y, s.cup)),
      ...[...sections].reverse().map((s) => toWorld(-s.halfWidth, s.y, s.cup)),
    ],
  }

  const hasThumb = solved.some((s) => s.c.finger === 'thumb')
  const solution: HandSolution = {
    fingers,
    knuckles,
    palm,
    ...(hasThumb ? { thumbRoot } : {}),
  }

  if (handedness === 'right') return solution
  return {
    fingers: solution.fingers.map((f) => ({
      ...f,
      points: f.points.map(mirrorX),
      contact: mirrorX(f.contact),
      contactNormal: mirrorX(f.contactNormal),
      spineDir: mirrorX(f.spineDir),
    })),
    knuckles: solution.knuckles.map((k) => ({ ...k, position: mirrorX(k.position) })),
    palm: {
      ...palm,
      origin: mirrorX(palm.origin),
      across: mirrorX(palm.across),
      wrist: mirrorX(palm.wrist),
      out: mirrorX(palm.out),
      outline: palm.outline.map(mirrorX),
    },
    ...(hasThumb ? { thumbRoot: mirrorX(thumbRoot) } : {}),
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

export interface ProjectedPoint {
  x: number
  y: number
  front: boolean
}

/** The one projection every hand part goes through: the schematic's presentation
    tilt, then an orthographic drop of z. */
export function projectHandPoint(p: Vec3, cx: number, cy: number, r: number, rotate?: (point: Vec3) => Vec3): ProjectedPoint {
  const q = rotate ? rotate(p) : v.rotateAxis(p, SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
  return { x: cx + q.x * r, y: cy - q.y * r, front: q.z >= 0 }
}

export function projectSpine(
  spine: FingerSpine,
  cx: number,
  cy: number,
  r: number,
  rotate?: (point: Vec3) => Vec3,
): ProjectedSpine {
  const place = (p: Vec3) => projectHandPoint(p, cx, cy, r, rotate)
  const meanRadius =
    spine.radii.reduce((a, b) => a + b, 0) / Math.max(1, spine.radii.length)
  return {
    finger: spine.finger,
    points: spine.points.map(place),
    contact: place(spine.contact),
    strokeWidth: meanRadius * 2 * r,
  }
}

export interface ProjectedHand {
  fingers: (ProjectedSpine & { label: string })[]
  palm: {
    outline: ProjectedPoint[]
    /** True when the palm sits between the viewer and the ball — the schematic
        draws it over the seam rather than behind it. */
    front: boolean
  }
}

/** Project a solved hand into schematic space. The 2D twin reads exactly the
    geometry the 3D model sweeps, so the two can never draw a different hold. */
export function projectHand(
  hand: HandSolution,
  labels: string[],
  cx: number,
  cy: number,
  r: number,
  rotate?: (point: Vec3) => Vec3,
): ProjectedHand {
  const outline = hand.palm.outline.map((p) => projectHandPoint(p, cx, cy, r, rotate))
  const meanZ = outline.reduce((a, p) => a + (p.front ? 1 : -1), 0)
  return {
    fingers: hand.fingers.map((f, i) => ({
      ...projectSpine(f, cx, cy, r, rotate),
      label: labels[i] ?? f.finger,
    })),
    palm: { outline, front: meanZ >= 0 },
  }
}
