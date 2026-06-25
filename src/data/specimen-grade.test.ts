import { describe, it, expect } from 'vitest'
import { specimenGradeFor } from './specimen-grade'
import { PITCHES } from './pitches'

/*
  The grade is a pure read of data already on the page — never a random draw,
  never a fabricated number, never a scarcity count. These tests pin that so a
  future edit can't quietly turn the collectible grade into a slot machine.
*/

const bySlug = (slug: string) => {
  const p = PITCHES.find((x) => x.display.slug === slug)
  if (!p) throw new Error(`no filed pitch with slug "${slug}"`)
  return p
}

describe('specimenGradeFor', () => {
  it('grades the four-seam (specimen 00) as the gold 1/1 chase', () => {
    expect(specimenGradeFor(bySlug('four-seam')).key).toBe('gold')
  })

  it('grades a pitch with the pitcher’s own moving grip (two-seam) as in-motion', () => {
    expect(specimenGradeFor(bySlug('two-seam')).key).toBe('in-motion')
  })

  it('grades a note-only filed pitch (circle-change) as a reference specimen', () => {
    expect(specimenGradeFor(bySlug('circle-change')).key).toBe('reference')
  })

  it('is a pure function — identical input gives an identical grade (no RNG, no clock)', () => {
    expect(specimenGradeFor(bySlug('slider'))).toEqual(specimenGradeFor(bySlug('slider')))
  })

  it('grades every filed pitch into exactly one of the four honest tiers', () => {
    const tiers = new Set(['gold', 'in-motion', 'first-party', 'reference'])
    for (const p of PITCHES) expect(tiers.has(specimenGradeFor(p).key)).toBe(true)
  })

  it('never prints a fabricated scarcity figure (the genuine 1/1 gold is the only edition number)', () => {
    for (const p of PITCHES) {
      const { key, label } = specimenGradeFor(p)
      // no limited-print / scarcity-count language anywhere
      expect(label).not.toMatch(/left|mint|limited|edition of|only \d/i)
      // no invented number on any tier except the real one-of-one gold chase
      if (key !== 'gold') expect(label).not.toMatch(/\d/)
    }
  })
})
