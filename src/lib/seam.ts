/*
  The one seam-point function.

  Every seam the page draws comes from here: the 3D tube, the 2D schematic, and
  the no-WebGL fallback. The model and the diagram can never disagree because
  they are the same math.

  Curve: the canonical closed-form figure-eight seam documented in sports-physics
  literature (Frontiers 2018; see docs/seam-calibration.md):

      x = 2 sin t + sin 3t
      y = 2 cos t - cos 3t
      z = 2 sqrt(2) cos 2t      for t in [0, 2 PI]

  The raw curve does not sit on a sphere, so every point is normalized to the
  ball radius. This is a seam-informed schematic, not a measured cover geometry.
*/

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Minimal vector kit, shared so SVG, 3D, and tests use one implementation. */
export const v = {
  add: (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  sub: (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
  scale: (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s }),
  dot: (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z,
  cross: (a: Vec3, b: Vec3): Vec3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }),
  length: (a: Vec3): number => Math.hypot(a.x, a.y, a.z),
  normalize: (a: Vec3): Vec3 => {
    const len = Math.hypot(a.x, a.y, a.z) || 1
    return { x: a.x / len, y: a.y / len, z: a.z / len }
  },
  /** Rodrigues rotation of p about a unit axis by angle radians. */
  rotateAxis: (p: Vec3, axis: Vec3, angle: number): Vec3 => {
    const k = v.normalize(axis)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const kc = v.cross(k, p)
    const kd = v.dot(k, p) * (1 - cos)
    return {
      x: p.x * cos + kc.x * sin + k.x * kd,
      y: p.y * cos + kc.y * sin + k.y * kd,
      z: p.z * cos + kc.z * sin + k.z * kd,
    }
  },
}

/** Raw figure-eight curve, before it is placed on the sphere. */
export function seamRaw(t: number): Vec3 {
  return {
    x: 2 * Math.sin(t) + Math.sin(3 * t),
    y: 2 * Math.cos(t) - Math.cos(3 * t),
    z: 2 * Math.SQRT2 * Math.cos(2 * t),
  }
}

/** A seam point on the sphere of the given radius, at parameter t in [0, 2 PI]. */
export function seamPoint(t: number, radius = 1): Vec3 {
  return v.scale(v.normalize(seamRaw(t)), radius)
}

/**
 * The closed seam as a polyline. Returns `segments + 1` points so the last
 * equals the first (an explicitly closed loop).
 */
export function seamPolyline(segments: number, radius = 1): Vec3[] {
  const pts: Vec3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    pts.push(seamPoint(t, radius))
  }
  return pts
}

/** Evenly spaced seam points (no duplicate closing point), for placing stitches. */
export function seamSamples(count: number, radius = 1): Vec3[] {
  const pts: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    pts.push(seamPoint(t, radius))
  }
  return pts
}

/**
 * Outward surface normal at a seam point. On a sphere centered at the origin
 * the normal is the normalized position, which is what places stitches and grip
 * markers proud of the leather.
 */
export function surfaceNormal(point: Vec3): Vec3 {
  return v.normalize(point)
}

/**
 * Near-horizontal backspin axis, in the same space as the seam. A slight tilt
 * keeps it from reading as a perfectly flat, lifeless axis. Shared by the 3D
 * spin and the schematic's axis vector so they agree.
 */
export const SPIN_AXIS: Vec3 = v.normalize({ x: 1, y: 0.12, z: 0 })

/**
 * Presentation tilt applied to the seam so the horseshoe faces the viewer in
 * both the 3D ball and the 2D schematic. Tuned visually; documented as a view
 * choice, not geometry.
 */
export const SEAM_VIEW_TILT = { axis: v.normalize({ x: 0.2, y: 1, z: 0.35 }), angle: 0.62 }

/** Seam polyline oriented for presentation (same orientation in 2D and 3D). */
export function orientedSeamPolyline(segments: number, radius = 1): Vec3[] {
  return seamPolyline(segments, radius).map((p) =>
    v.rotateAxis(p, SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle),
  )
}
