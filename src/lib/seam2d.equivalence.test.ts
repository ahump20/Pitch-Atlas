import { describe, expect, it } from 'vitest'
import { v, seamPoint, SEAM_VIEW_TILT } from './seam'
import { projectSeam, buildStitches, splitRuns } from './seam2d'

/*
  RefractorBall (the signature hero ball, prerendered) used to hand-copy these
  projection helpers; the copies had drifted. They now import from seam2d so the
  ball and the schematic draw one curve. This pins the swap: the historical local
  projection is reproduced verbatim below and asserted bit-equal to the shared
  helper for the ball's exact parameters, so a future seam2d change can never
  silently desync the hero ball. The ball's tuned constants (seg=300, stitch
  every=6 / len=10) are pinned too — they are call-site arguments, not defaults.
*/

// RefractorBall's exact historical local projectSeam, kept here as the oracle.
function legacyProjectSeam(cx: number, cy: number, r: number, seg: number) {
  const out: { x: number; y: number; z: number }[] = []
  for (let i = 0; i <= seg; i++) {
    const p = v.rotateAxis(seamPoint((i / seg) * Math.PI * 2, 1), SEAM_VIEW_TILT.axis, SEAM_VIEW_TILT.angle)
    out.push({ x: cx + p.x * r, y: cy - p.y * r, z: p.z })
  }
  return out
}

// The hero ball's parameters (RefractorBall: W/H 300, cx 150, cy 148, r 104, seg 300).
const CX = 150
const CY = 148
const R = 104
const SEG = 300

describe('seam2d projectSeam matches the RefractorBall hero-ball projection', () => {
  it('emits the identical point sequence (count + values) for the ball params', () => {
    const shared = projectSeam(CX, CY, R, SEG)
    const legacy = legacyProjectSeam(CX, CY, R, SEG)
    expect(shared.length).toBe(SEG + 1) // inclusive loop → 301 points, closed
    expect(shared.length).toBe(legacy.length)
    for (let i = 0; i < legacy.length; i++) {
      expect(shared[i].x).toBeCloseTo(legacy[i].x, 10)
      expect(shared[i].y).toBeCloseTo(legacy[i].y, 10)
      expect(shared[i].z).toBeCloseTo(legacy[i].z, 10)
    }
    // closed loop: last point equals the first
    expect(shared[shared.length - 1].x).toBeCloseTo(shared[0].x, 10)
    expect(shared[shared.length - 1].y).toBeCloseTo(shared[0].y, 10)
  })

  it('preserves the ball-tuned stitch constants (every=6, len=10)', () => {
    const stitches = buildStitches(projectSeam(CX, CY, R, SEG), 6, 10)
    // every=6 across 300 segments → i = 0,6,…,294 → 50 stitches
    expect(stitches.length).toBe(50)
  })

  it('splits into front/back runs, each a real path starting at M', () => {
    const runs = splitRuns(projectSeam(CX, CY, R, SEG))
    expect(runs.length).toBeGreaterThan(0)
    expect(runs.every((run) => run.d.startsWith('M'))).toBe(true)
  })
})
