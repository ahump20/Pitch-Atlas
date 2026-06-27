import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { PITCHES, pitchBySlug } from './pitches'
import { fourSeam } from './pitches/four-seam'
import { SOURCES, src, latestRetrievedAt, allSources } from './sources'
import { CONFIDENCE_META } from './types'
import type { Claim, PitchAtlasEntry } from './types'
import { CRAFTSMEN } from './craftsmen'
import { SOFTBALL_CRAFTSMEN } from './softball/craftsmen'
import { LOST_PITCHES } from './lost-pitches'
import { LOST_PITCH_ARCHIVE_IMAGES, archiveImageForLostPitch } from './media/archive-images'
import { REPERTOIRE } from './repertoire'
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

  it('stocks every lost pitch with one rights-labeled archive plate', () => {
    expect(LOST_PITCH_ARCHIVE_IMAGES).toHaveLength(LOST_PITCHES.length)
    for (const pitch of LOST_PITCHES) {
      const image = archiveImageForLostPitch(pitch.slug)
      expect(image?.relatedSlug).toBe(pitch.slug)
      expect(image?.imageSrc).toMatch(/^\/archive\/lost-pitches\/.+\.(jpg|png|webp|svg)$/)
      expect(existsSync(join(process.cwd(), 'public', image?.imageSrc ?? ''))).toBe(true)
      expect(image?.alt.length).toBeGreaterThan(20)
      expect(image?.qualityNote.length).toBeGreaterThan(20)
      if (image?.rights === 'public-domain') expect(image.source).toBeTruthy()
      if (image?.rights === 'original') expect(image.source).toBeUndefined()
    }
  })
})

/*
  The honesty contract reaches beyond the pitch specimens. The craftsmen halls,
  the lost-pitches archive, and the repertoire index all carry sourced claims, and
  a weak claim (unverified or secondhand) must always carry its explanatory note.
  This walks every claim in those arrays — by structure, so no hand-listed field
  can quietly fall out of coverage — and enforces the same invariant the pitch
  specimens already meet. The compile-time Claim union now refuses a noteless weak
  claim too; this is the runtime backstop for data authored via raw literals.
*/
const KNOWN_TIERS = new Set(VALID_CONFIDENCE)
function harvestClaims(node: unknown, acc: Claim<unknown>[] = [], seen = new Set<object>()): Claim<unknown>[] {
  if (node === null || typeof node !== 'object') return acc
  if (seen.has(node as object)) return acc
  seen.add(node as object)
  const rec = node as Record<string, unknown>
  if (typeof rec.confidence === 'string' && KNOWN_TIERS.has(rec.confidence)) {
    acc.push(node as Claim<unknown>)
  }
  if (Array.isArray(node)) {
    for (const item of node) harvestClaims(item, acc, seen)
  } else {
    for (const key of Object.keys(rec)) harvestClaims(rec[key], acc, seen)
  }
  return acc
}

describe('provenance note invariant, all sourced data arrays', () => {
  const ARRAYS: Array<{ name: string; data: unknown[] }> = [
    { name: 'CRAFTSMEN', data: CRAFTSMEN },
    { name: 'SOFTBALL_CRAFTSMEN', data: SOFTBALL_CRAFTSMEN },
    { name: 'LOST_PITCHES', data: LOST_PITCHES },
    { name: 'REPERTOIRE', data: REPERTOIRE },
  ]
  for (const { name, data } of ARRAYS) {
    describe(name, () => {
      const claims = harvestClaims(data)

      it('has sourced claims to check', () => {
        expect(claims.length).toBeGreaterThan(0)
      })

      it('every claim carries a valid confidence tier', () => {
        for (const cl of claims) expect(VALID_CONFIDENCE).toContain(cl.confidence)
      })

      it('weak claims (unverified / secondhand) carry a non-empty note', () => {
        for (const cl of claims) {
          if (cl.confidence === 'unverified' || cl.confidence === 'secondhand-attributed') {
            expect(typeof cl.note === 'string' && cl.note.length > 0).toBe(true)
          }
        }
      })

      it('every cited source is well-formed', () => {
        for (const cl of claims) {
          if (cl.source) {
            expect(cl.source.url).toMatch(/^https?:\/\//)
            expect(cl.source.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          }
        }
      })
    })
  }
})
