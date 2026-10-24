import { describe, it, expect } from 'vitest'
import { IN } from './geometry'
import { DEFAULT_STANCE, compareBats, contactPivot, heightComfort, landmarks, reachAt, sweetSpotReach } from './batter'

/*
  The batter model, pinned to the original build's numbers (its own functions
  run in Node). Anchors from the live app at the default batter: shoulder 49,
  chest 41, belt 31, front knee 15; "Barrel reach +2.0 in vs 32" and "To match
  your 32 +2.4 in away".
*/

describe('landmarks', () => {
  it('scale the measured ratios to height', () => {
    const l = landmarks(62)
    expect(l.knee / IN).toBeCloseTo(15.004, 3)
    expect(l.belt / IN).toBeCloseTo(31.186, 3)
    expect(l.chest / IN).toBeCloseTo(40.982, 3)
    expect(l.shoulder / IN).toBeCloseTo(48.98, 3)
    expect(Math.round(landmarks(66).shoulder / IN)).toBe(52)
    expect(Math.round(landmarks(54).knee / IN)).toBe(13)
  })
})

describe('reach and stance', () => {
  it('sweet-spot reach for a 34 in bat', () => {
    expect(sweetSpotReach(62, 34) / IN).toBeCloseTo(45.8986, 3)
    expect(sweetSpotReach(66, 34) / IN).toBeCloseTo(47.2714, 3)
    expect(sweetSpotReach(54, 34) / IN).toBeCloseTo(43.153, 3)
  })

  it('pivot sits off the plate and a stride forward; the box moves it 16 in', () => {
    const p = contactPivot(DEFAULT_STANCE)
    expect(p.x / IN).toBeCloseTo(-36.018, 3)
    expect(p.z / IN).toBeCloseTo(-9.92, 3)
    expect(contactPivot({ ...DEFAULT_STANCE, box: 'front' }).z / IN).toBeCloseTo(-25.92, 3)
    expect(contactPivot({ ...DEFAULT_STANCE, box: 'back' }).z / IN).toBeCloseTo(6.08, 3)
    expect(contactPivot({ ...DEFAULT_STANCE, toesIn: 10 }).x / IN).toBeCloseTo(-24.018, 3)
  })

  it('a ball down the middle meets the barrel; too close jams, too far is off the end', () => {
    expect(reachAt(DEFAULT_STANCE, 0).side).toBe('barrel')
    expect(reachAt({ ...DEFAULT_STANCE, toesIn: 4 }, -8 * IN).side).toBe('jam')
    expect(reachAt({ ...DEFAULT_STANCE, toesIn: 36 }, 8 * IN).side).toBe('end')
  })

  it('height comfort is full from belt to chest and fades past knee and shoulder', () => {
    const l = landmarks(62)
    expect(heightComfort(62, (l.belt + l.chest) / 2)).toBe(1)
    expect(heightComfort(62, l.knee)).toBeCloseTo(0.4, 6)
    expect(heightComfort(62, l.shoulder)).toBeCloseTo(0.45, 6)
    expect(heightComfort(62, l.shoulder + 7 * IN)).toBe(0)
  })
})

describe('the 34 in bat against an old bat', () => {
  it('matches the live app: +2.0 in reach vs 32, +2.4 in away to match it', () => {
    const c = compareBats(DEFAULT_STANCE, 32)
    expect(c.reachGapIn.toFixed(1)).toBe('2.0')
    expect(c.matchShiftIn.toFixed(1)).toBe('2.4')
    expect(c.outFrontIn[0]).toBeCloseTo(28.4497, 3)
    expect(c.outFrontIn[1]).toBeCloseTo(25.1487, 3)
  })

  it('31 and 33 in, and other heights', () => {
    expect(compareBats(DEFAULT_STANCE, 31).reachGapIn).toBeCloseTo(2.9544, 3)
    expect(compareBats(DEFAULT_STANCE, 31).matchShiftIn).toBeCloseTo(3.476, 3)
    expect(compareBats(DEFAULT_STANCE, 33).matchShiftIn).toBeCloseTo(1.2208, 3)
    expect(compareBats({ ...DEFAULT_STANCE, heightIn: 66 }, 32).matchShiftIn).toBeCloseTo(2.4255, 3)
    expect(compareBats({ ...DEFAULT_STANCE, heightIn: 54 }, 32).matchShiftIn).toBeCloseTo(2.2789, 3)
  })
})
