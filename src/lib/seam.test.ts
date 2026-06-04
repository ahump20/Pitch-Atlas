import { describe, it, expect } from 'vitest'
import { seamPoint, seamPolyline, seamSamples, orientedSeamPolyline, surfaceNormal, v } from './seam'

describe('seam geometry', () => {
  it('returns a closed loop: first point equals last', () => {
    const pts = seamPolyline(64, 1)
    expect(pts).toHaveLength(65)
    const first = pts[0]
    const last = pts[pts.length - 1]
    expect(last.x).toBeCloseTo(first.x, 6)
    expect(last.y).toBeCloseTo(first.y, 6)
    expect(last.z).toBeCloseTo(first.z, 6)
  })

  it('places every point on the sphere of the given radius', () => {
    const R = 1.4
    for (const p of seamSamples(120, R)) {
      expect(v.length(p)).toBeCloseTo(R, 6)
    }
  })

  it('is deterministic for the same parameter', () => {
    const a = seamPoint(1.234, 1)
    const b = seamPoint(1.234, 1)
    expect(a).toEqual(b)
  })

  it('never divides by zero (magnitude stays positive across the loop)', () => {
    for (let i = 0; i < 360; i++) {
      const p = seamPoint((i / 360) * Math.PI * 2, 1)
      expect(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)).toBe(true)
    }
  })

  it('surface normal is unit length and points outward', () => {
    const p = seamPoint(0.8, 1)
    const n = surfaceNormal(p)
    expect(v.length(n)).toBeCloseTo(1, 6)
    expect(v.dot(n, p)).toBeGreaterThan(0)
  })

  it('oriented polyline returns segments + 1 points and stays on the sphere', () => {
    const pts = orientedSeamPolyline(48, 1)
    expect(pts).toHaveLength(49)
    for (const p of pts) expect(v.length(p)).toBeCloseTo(1, 5)
  })
})

describe('vector kit', () => {
  it('cross product is perpendicular to its inputs', () => {
    const a = { x: 1, y: 0, z: 0 }
    const b = { x: 0, y: 1, z: 0 }
    const c = v.cross(a, b)
    expect(c).toEqual({ x: 0, y: 0, z: 1 })
    expect(v.dot(c, a)).toBe(0)
    expect(v.dot(c, b)).toBe(0)
  })

  it('rotateAxis by a full turn returns the original point', () => {
    const p = { x: 0.3, y: 0.7, z: -0.2 }
    const r = v.rotateAxis(p, { x: 0, y: 1, z: 0 }, Math.PI * 2)
    expect(r.x).toBeCloseTo(p.x, 6)
    expect(r.y).toBeCloseTo(p.y, 6)
    expect(r.z).toBeCloseTo(p.z, 6)
  })
})
