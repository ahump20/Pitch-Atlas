import { describe, it, expect } from 'vitest'
import { fourSeam } from './pitches/four-seam'
import { SOURCES, src, latestRetrievedAt, allSources } from './sources'
import { CONFIDENCE_META } from './types'
import type { Claim } from './types'

function collectClaims(): Claim<unknown>[] {
  const c = fourSeam.canonical
  const claims: Claim<unknown>[] = [
    c.grip,
    ...c.gripDetails,
    c.mechanics,
    c.physics.spinAxis,
    c.physics.spinRateRpm,
    c.physics.activeSpinPct,
    c.physics.inducedVerticalBreakIn,
    c.physics.magnus,
    fourSeam.seam.stitchCount,
    fourSeam.seam.accuracyNote,
  ]
  if (c.voice) claims.push(c.voice)
  for (const mv of fourSeam.masterVariants) for (const n of mv.numbers) claims.push(n.claim)
  return claims
}

const VALID_CONFIDENCE = Object.keys(CONFIDENCE_META)

describe('provenance integrity (the honesty contract, enforced in data)', () => {
  const claims = collectClaims()

  it('every claim carries a valid confidence level', () => {
    for (const cl of claims) expect(VALID_CONFIDENCE).toContain(cl.confidence)
  })

  it('confident claims have a real source; weak claims have a note', () => {
    for (const cl of claims) {
      if (cl.confidence === 'unverified' || cl.confidence === 'secondhand-attributed') {
        expect(typeof cl.note === 'string' && cl.note.length > 0).toBe(true)
      } else {
        expect(cl.source).toBeTruthy()
      }
    }
  })

  it('every cited source has an http(s) url and a real retrievedAt date', () => {
    for (const cl of claims) {
      if (cl.source) {
        expect(cl.source.url).toMatch(/^https?:\/\//)
        expect(cl.source.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('labels the seam honestly as a schematic, never seam-accurate', () => {
    expect(fourSeam.seam.accuracyLevel).toBe('seam-informed schematic')
  })

  it('does not fabricate a Cole quote', () => {
    const cole = fourSeam.masterVariants.find((m) => m.pitcher === 'Gerrit Cole')
    expect(cole).toBeTruthy()
    expect(cole?.quote).toBeUndefined()
  })

  it('demonstrates the secondhand-attributed label with a real, sourced claim', () => {
    expect(fourSeam.canonical.voice?.confidence).toBe('secondhand-attributed')
    expect(fourSeam.canonical.voice?.source).toBeTruthy()
    expect(fourSeam.canonical.voice?.note?.length ?? 0).toBeGreaterThan(0)
  })

  it('keeps community an honest empty state with no fabricated rows or counts', () => {
    expect(fourSeam.community.enabled).toBe(false)
    expect(fourSeam.community.columns).toHaveLength(4)
    expect('rows' in fourSeam.community).toBe(false)
    expect('adoption' in fourSeam.community).toBe(false)
  })

  it('marks era-dependent and methodology-bound figures as approximate', () => {
    expect(fourSeam.canonical.physics.spinRateRpm.approximate).toBe(true)
    const strider = fourSeam.masterVariants.find((m) => m.pitcher === 'Spencer Strider')
    const riseVsAvg = strider?.numbers.find((n) => n.label === 'Rise vs MLB avg')
    expect(riseVsAvg?.claim.approximate).toBe(true)
  })

  it('throws on an unknown source id', () => {
    // @ts-expect-error deliberately bad id
    expect(() => src('does-not-exist')).toThrow()
  })

  it('computes the most recent retrievedAt across the registry', () => {
    expect(latestRetrievedAt(allSources())).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('keeps every registry source well-formed', () => {
    for (const s of Object.values(SOURCES)) {
      expect(s.url).toMatch(/^https?:\/\//)
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
