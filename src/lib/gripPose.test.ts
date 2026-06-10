import { describe, expect, it } from 'vitest'
import { solveGripPose, projectSpine, type GripPoseContact } from './gripPose'
import { seamPoint, v } from './seam'

/*
  The solver is the single source of finger geometry for the 3D hand, the 2D
  schematic, and the authoring acceptance tests. These tests pin its contract:
  on-seam means on the seam, offsets move along the surface by the stated arc,
  azimuth turns the spine relative to the seam tangent, engagement decides how
  much leather the finger hugs, and a left hand is a true mirror.
*/

const base: GripPoseContact = {
  finger: 'index',
  seamT: 0.305,
  lift: 0,
  seamOffset: 0,
  azimuth: 90,
  engagement: 'pad',
  curl: 0.2,
}

const angleBetween = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  Math.acos(Math.min(1, Math.max(-1, v.dot(v.normalize(a), v.normalize(b)))))

describe('gripPose solver', () => {
  it('puts a zero-offset contact exactly on the seam', () => {
    const spine = solveGripPose(base)
    const seam = seamPoint(base.seamT * Math.PI * 2, 1)
    expect(angleBetween(spine.contact, seam)).toBeLessThan(1e-6)
  })

  it('moves the contact along the surface by the stated offset arc', () => {
    const offset = 0.1
    const spine = solveGripPose({ ...base, seamOffset: offset })
    const seam = seamPoint(base.seamT * Math.PI * 2, 1)
    expect(angleBetween(spine.contact, seam)).toBeCloseTo(offset, 3)
    // and stays on the unit sphere
    expect(v.length(spine.contact)).toBeCloseTo(1, 6)
  })

  it('lays an azimuth-90 spine across the seam and an azimuth-0 spine along it', () => {
    const across = solveGripPose({ ...base, azimuth: 90 })
    const along = solveGripPose({ ...base, azimuth: 0 })
    // the seam tangent, approximated through two nearby seam points
    const e = 1e-3
    const t1 = seamPoint(base.seamT * Math.PI * 2 - e, 1)
    const t2 = seamPoint(base.seamT * Math.PI * 2 + e, 1)
    const tangent = v.normalize(v.sub(t2, t1))
    expect(Math.abs(v.dot(across.spineDir, tangent))).toBeLessThan(0.1)
    expect(Math.abs(v.dot(along.spineDir, tangent))).toBeGreaterThan(0.9)
  })

  it('keeps every spine point on or above the leather', () => {
    for (const engagement of ['tip', 'pad', 'inside', 'nail', 'knuckle'] as const) {
      const spine = solveGripPose({ ...base, engagement })
      for (const p of spine.points) {
        expect(v.length(p)).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('holds a nail or knuckle engagement proud of the ball, flesh off the leather', () => {
    const pad = solveGripPose({ ...base, engagement: 'pad' })
    const nail = solveGripPose({ ...base, engagement: 'nail' })
    const knuckle = solveGripPose({ ...base, engagement: 'knuckle' })
    const minHeight = (s: typeof pad) => Math.min(...s.points.map((p) => v.length(p)))
    expect(minHeight(nail)).toBeGreaterThan(minHeight(pad))
    expect(minHeight(knuckle)).toBeGreaterThan(minHeight(pad))
  })

  it('orders surface hug by engagement depth: inside > pad > tip', () => {
    const inside = solveGripPose({ ...base, engagement: 'inside' })
    const pad = solveGripPose({ ...base, engagement: 'pad' })
    const tip = solveGripPose({ ...base, engagement: 'tip' })
    expect(inside.contactArc).toBeGreaterThan(pad.contactArc)
    expect(pad.contactArc).toBeGreaterThan(tip.contactArc)
  })

  it('mirrors a left hand across x', () => {
    const right = solveGripPose(base, { handedness: 'right' })
    const left = solveGripPose(base, { handedness: 'left' })
    expect(left.contact.x).toBeCloseTo(-right.contact.x, 9)
    expect(left.contact.y).toBeCloseTo(right.contact.y, 9)
    expect(left.contact.z).toBeCloseTo(right.contact.z, 9)
    left.points.forEach((p, i) => {
      expect(p.x).toBeCloseTo(-right.points[i].x, 9)
    })
  })

  it('projects the spine into schematic space with front/back flags', () => {
    const spine = solveGripPose(base)
    const projected = projectSpine(spine, 120, 120, 86)
    expect(projected.points).toHaveLength(spine.points.length)
    expect(projected.strokeWidth).toBeGreaterThan(0)
    for (const p of projected.points) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
      expect(typeof p.front).toBe('boolean')
    }
  })
})
