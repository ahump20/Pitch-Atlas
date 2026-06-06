import { describe, it, expect } from 'vitest'
import { classifyPitch, filedSlugFor } from './classify'
import { pitchBySlug } from '../data/pitches'

/*
  The classifier's honesty contract: the same self-test set that ships with the
  pitching-coach skill's classify_pitch.py, ported here so the TS port stays
  faithful. Each archetype tracking line must land in its expected family (some
  boundaries are genuinely shared, so a set of acceptable answers is allowed).
*/

const CASES: { input: Parameters<typeof classifyPitch>[0]; expected: string[] }[] = [
  { input: { velo: 97, ivb: 17, hb: 7 }, expected: ['four-seam fastball'] },
  { input: { velo: 93, ivb: 5, hb: 15 }, expected: ['sinker', 'two-seam fastball'] },
  { input: { velo: 89, ivb: 8, hb: -4 }, expected: ['cutter'] },
  { input: { velo: 86, ivb: -5, hb: 4 }, expected: ['splitter'] },
  { input: { velo: 85, ivb: 3, hb: 13 }, expected: ['changeup'] },
  { input: { velo: 86, ivb: -2, hb: -7 }, expected: ['slider'] },
  { input: { velo: 84, ivb: -2, hb: -16 }, expected: ['sweeper'] },
  { input: { velo: 82, ivb: -7, hb: -12 }, expected: ['slurve'] },
  { input: { velo: 79, ivb: -14, hb: -5 }, expected: ['curveball'] },
  { input: { velo: 88, ivb: 0, hb: -5, eff: 18 }, expected: ['gyro slider'] },
  { input: { velo: 68, ivb: 1, hb: 2, spin: 1100 }, expected: ['knuckleball'] },
  { input: { velo: 55, ivb: -18, hb: 0 }, expected: ['eephus'] },
]

describe('pitch classifier', () => {
  for (const { input, expected } of CASES) {
    it(`classifies velo=${input.velo} ivb=${input.ivb} hb=${input.hb} as ${expected.join(' | ')}`, () => {
      expect(expected).toContain(classifyPitch(input).best)
    })
  }

  it('always carries the reasoned-not-verified honesty note', () => {
    const r = classifyPitch({ velo: 92, ivb: 12, hb: 8 })
    expect(r.notes.some((n) => n.includes('Reasoned, not verified'))).toBe(true)
  })

  it('flags a far-from-everything shape as low confidence', () => {
    const r = classifyPitch({ velo: 70, ivb: 25, hb: 25 })
    expect(r.confidence).toBe('low')
  })

  it('maps a filed family back to a real specimen, and leaves unfiled ones null', () => {
    const slug = filedSlugFor('sweeper')
    expect(slug).toBe('sweeper')
    expect(pitchBySlug(slug as string)).toBeTruthy()
    expect(filedSlugFor('screwball')).toBeNull()
  })
})
