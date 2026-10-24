import { describe, it, expect } from 'vitest'
import { IN, PLATE } from './geometry'
import { distanceToPlate, inchesPastFront, insidePlate, legalArcWindow, onPlateOrMat, zoneBounds } from './zone'

describe('legal arc window', () => {
  it('USSSA measures its 3 ft floor from the hand (release 0.86 m, about 2.8 ft)', () => {
    const [min, max] = legalArcWindow('usssa')
    expect(min).toBeCloseTo(5.8215, 3)
    expect(max).toBe(10)
  })

  it('USA Softball adult play: 6 to 10 ft; Senior: 6 to 12 ft', () => {
    expect(legalArcWindow('usa')).toEqual([6, 10])
    expect(legalArcWindow('senior')).toEqual([6, 12])
  })
})

describe('zone bounds', () => {
  it('runs knee to shoulder for the 5 ft 2 in batter', () => {
    const { bottom, top } = zoneBounds(62)
    expect(bottom / IN).toBeCloseTo(15.004, 2)
    expect(top / IN).toBeCloseTo(48.98, 2)
  })
})

describe('plate and mat', () => {
  it('knows the plate outline', () => {
    expect(insidePlate(0, 0)).toBe(true)
    expect(insidePlate(0, PLATE.front + 0.01)).toBe(true)
    expect(insidePlate(PLATE.halfWidth + 0.01, 0)).toBe(false)
    // The back point is a triangle: a corner behind the sides is off the plate.
    expect(insidePlate(PLATE.halfWidth - 0.01, PLATE.back - 0.01)).toBe(false)
  })

  it('measures distance to the plate edge', () => {
    expect(distanceToPlate(0, 0)).toBe(0)
    expect(distanceToPlate(PLATE.halfWidth + 1 * IN, -0.05) / IN).toBeCloseTo(1, 5)
  })

  it('Senior: the mat runs 32.5 in back from the end of the plate’s sides', () => {
    expect(onPlateOrMat(0, 30 * IN)).toBe(true)
    expect(onPlateOrMat(0, 33 * IN)).toBe(false)
    expect(onPlateOrMat(9 * IN, 10 * IN)).toBe(false)
    expect(inchesPastFront(32.5 * IN)).toBeCloseTo(41, 6)
  })
})
