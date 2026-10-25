import { describe, it, expect } from 'vitest'
import { FT, IN, PLATE, RELEASE } from './geometry'
import { acceleration, descentAtDepth, descentDepthAtHeight, positionAt, progressAt, solveLob, spinVector } from './flight'

/*
  The flight model, pinned to the original build's numbers for the belt-high
  example lob (apex 9 ft, lands 36 in past the front edge, 110 rpm). Expected
  values come from the original's own functions run in Node.
*/
const BELT = { apex: 9, land: 36, side: 0, rpm: 110, push: 0 }

describe('acceleration', () => {
  it('is pure gravity at rest', () => {
    expect(acceleration([0, 1e-9, 0], null)[1]).toBeCloseTo(-9.81, 3)
  })

  it('drags against the motion', () => {
    const a = acceleration([0, 0, 10], null)
    expect(a[2]).toBeLessThan(0)
    expect(a[0]).toBe(-0)
  })

  it('backspin lifts a ball travelling toward the plate', () => {
    const v: [number, number, number] = [0, 0, 10]
    const lifted = acceleration(v, spinVector(v, { rpm: 300, push: 0 }))
    expect(lifted[1]).toBeGreaterThan(acceleration(v, null)[1])
  })

  it('no spin, no spin vector', () => {
    expect(spinVector([0, 1, 1], { rpm: 0, push: 0 })).toBeNull()
  })
})

describe('solveLob, belt-high lob', () => {
  const f = solveLob(BELT)

  it('hits the target peak and landing spot', () => {
    expect(f.apex[1] / FT).toBeCloseTo(9, 3)
    expect((f.land.z - PLATE.front) / IN).toBeCloseTo(36, 1)
    expect(f.land.x / IN).toBeCloseTo(0, 1)
  })

  it('matches the original: flight time, release speed, plate crossing', () => {
    expect(f.duration).toBeCloseTo(1.3832, 3)
    expect(f.releaseMph).toBeCloseTo(29.334, 2)
    expect(f.crossing.y / IN).toBeCloseTo(20.447, 2)
    expect(f.crossing.angle).toBeCloseTo(32.653, 2)
    expect(f.spinCarryIn).toBeCloseTo(12.467, 2)
  })

  it('starts at the release point and is sampled densely', () => {
    expect(f.positions[0]).toBeCloseTo(RELEASE.x, 5)
    expect(f.positions[1]).toBeCloseTo(RELEASE.y, 5)
    expect(f.positions[2]).toBeCloseTo(RELEASE.z, 5)
    expect(f.count).toBeGreaterThan(500)
  })
})

describe('path lookups', () => {
  const f = solveLob(BELT)

  it('positionAt clamps to the ends', () => {
    expect(positionAt(f, -1)[2]).toBeCloseTo(RELEASE.z, 5)
    expect(positionAt(f, 99)[2]).toBeCloseTo(f.land.z, 5)
    expect(positionAt(f, f.duration / 2)[1]).toBeGreaterThan(RELEASE.y)
  })

  it('progressAt runs 0 to 1 and never goes back', () => {
    let last = -1
    for (let t = 0; t <= f.duration; t += 0.05) {
      const p = progressAt(f, t)
      expect(p).toBeGreaterThanOrEqual(last)
      last = p
    }
    expect(progressAt(f, 0)).toBe(0)
    expect(progressAt(f, f.duration)).toBe(1)
  })

  it('descent lookups agree with each other', () => {
    const y = 0.8
    const z = descentDepthAtHeight(f, y)!
    expect(descentAtDepth(f, z)![1]).toBeCloseTo(y, 3)
    expect(descentAtDepth(f, 0)![1] / IN).toBeCloseTo(20.447, 1)
    expect(descentAtDepth(f, 10)).toBeNull()
    expect(descentDepthAtHeight(f, 99)).toBeNull()
  })
})

describe('solveLob, when it cannot find the throw', () => {
  it('says the belt-high lob was solved', () => {
    expect(solveLob(BELT).converged).toBe(true)
  })

  it('says so when no throw peaks and lands where asked', () => {
    // Landing hundreds of feet to the side off a 4 ft peak: no lob does that.
    const f = solveLob({ apex: 4.2, land: 36, side: 10000, rpm: 110, push: 0 })
    expect(f.converged).toBe(false)
  })
})
