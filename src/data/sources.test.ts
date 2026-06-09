import { describe, it, expect } from 'vitest'
import { PITCHES, pitchBySlug } from './pitches'
import { fourSeam } from './pitches/four-seam'
import { SOURCES, src, latestRetrievedAt, allSources } from './sources'
import { CONFIDENCE_META } from './types'
import type { Claim, PitchAtlasEntry } from './types'
import { magnusForceRender, magnusStrength } from '../lib/physics'

/*
  The honesty contract, enforced in data, across every pitch in the atlas. If a
  new specimen ships an unsourced claim, a fabricated quote, a seam-accurate
  claim, or a shape it cannot physically draw, one of these fails.
*/

function collectClaims(entry: PitchAtlasEntry): Claim<unknown>[] {
  const c = entry.canonical
  const p = c.physics
  const claims: Claim<unknown>[] = [
    c.grip,
    ...c.gripDetails,
    c.mechanics,
    p.spinAxis,
    p.shape,
    p.teaching,
    entry.seam.stitchCount,
    entry.seam.accuracyNote,
  ]
  if (c.voice) claims.push(c.voice)
  for (const mv of entry.masterVariants) {
    claims.push(mv.distinction)
    for (const n of mv.accolades ?? []) claims.push(n.claim)
    if (mv.quote) claims.push(mv.quote)
  }
  return claims
}

const VALID_CONFIDENCE = Object.keys(CONFIDENCE_META)

describe('provenance integrity, every pitch', () => {
  for (const entry of PITCHES) {
    describe(entry.canonical.name, () => {
      const claims = collectClaims(entry)

      it('carries claims to check', () => {
        expect(claims.length).toBeGreaterThan(8)
      })

      it('every claim has a valid confidence level', () => {
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
        expect(entry.seam.accuracyLevel).toBe('seam-informed schematic')
      })

      it('keeps the live community layer free of fabricated rows or counts in the data', () => {
        // The layer is open; live notes come from the database. The static data
        // must never ship hardcoded rows or counts — that is the anti-mock guarantee.
        expect(entry.community.enabled).toBe(true)
        expect(entry.community.columns).toHaveLength(4)
        expect('rows' in entry.community).toBe(false)
        expect('adoption' in entry.community).toBe(false)
      })

      it('draws a force consistent with its shape language', () => {
        const m = entry.motion
        if (m.gyro) {
          // gyro pitch: most spin does no Magnus work, so the force is weak
          expect(magnusStrength(m.spinAxis)).toBeLessThan(0.45)
        } else {
          const fy = magnusForceRender(m.spinAxis).y
          if (m.verticalShape === 'ride') expect(fy).toBeGreaterThan(0)
          if (m.verticalShape === 'drop') expect(fy).toBeLessThan(0)
        }
      })

      it('has a slug and a two-digit specimen number', () => {
        expect(entry.display.slug).toMatch(/^[a-z0-9-]+$/)
        expect(entry.display.specimenNo).toMatch(/^\d\d$/)
      })
    })
  }

  it('every slug resolves back to its pitch and is unique', () => {
    const slugs = PITCHES.map((p) => p.display.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const p of PITCHES) expect(pitchBySlug(p.display.slug)).toBe(p)
    expect(pitchBySlug('does-not-exist')).toBeUndefined()
  })

  it('the four-seam does not fabricate a Cole quote', () => {
    const cole = fourSeam.masterVariants.find((m) => m.pitcher === 'Gerrit Cole')
    expect(cole).toBeTruthy()
    expect(cole?.quote).toBeUndefined()
  })

  it('demonstrates the secondhand-attributed label with real, sourced quotes', () => {
    const seconds = PITCHES.map((p) => p.canonical.voice).filter(
      (v) => v && v.confidence === 'secondhand-attributed',
    )
    expect(seconds.length).toBeGreaterThanOrEqual(2) // four-seam (Nathan) + changeup (Williams)
    for (const v of seconds) {
      expect(v?.source).toBeTruthy()
      expect((v?.note?.length ?? 0) > 0).toBe(true)
    }
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
