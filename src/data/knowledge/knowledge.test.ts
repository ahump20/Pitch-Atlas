import { describe, it, expect } from 'vitest'
import { WINGS, wingBySlug, knowledgeSources } from './index'
import { CONFIDENCE_META } from '../types'
import type { Claim } from '../types'

/*
  The honesty contract for the teaching layer, the same one the specimens live
  under. A wing that ships an unsourced figure, a weak claim with no note, a broken
  citation URL, or an off-site "related" link fails the build here.
*/

const VALID_CONFIDENCE = Object.keys(CONFIDENCE_META)

function sectionClaims(claims: Claim<string>[] | undefined, pull?: { claim: Claim<string> }): Claim<string>[] {
  const out = [...(claims ?? [])]
  if (pull) out.push(pull.claim)
  return out
}

describe('knowledge wings, provenance integrity', () => {
  it('files at least the ten planned wings', () => {
    expect(WINGS.length).toBeGreaterThanOrEqual(10)
  })

  it('every slug is kebab-case and resolves back uniquely', () => {
    const slugs = WINGS.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const w of WINGS) {
      expect(w.slug).toMatch(/^[a-z0-9-]+$/)
      expect(wingBySlug(w.slug)).toBe(w)
    }
    expect(wingBySlug('does-not-exist')).toBeUndefined()
  })

  for (const wing of WINGS) {
    describe(wing.navLabel || wing.title, () => {
      it('has the meta a hub card and a page need', () => {
        expect(wing.title.length).toBeGreaterThan(0)
        expect(wing.summary.length).toBeGreaterThan(0)
        expect(wing.summary.length).toBeLessThanOrEqual(200)
        expect(wing.sub.length).toBeGreaterThan(0)
        expect(wing.confidenceNote.length).toBeGreaterThan(0)
        expect(typeof wing.educational === 'boolean' || wing.educational === undefined).toBe(true)
      })

      it('has at least three teaching sections, each with prose and a backing claim', () => {
        expect(wing.sections.length).toBeGreaterThanOrEqual(3)
        for (const s of wing.sections) {
          expect(s.heading.length).toBeGreaterThan(0)
          expect(s.paragraphs.length).toBeGreaterThan(0)
          for (const p of s.paragraphs) expect(p.length).toBeGreaterThan(0)
          expect(sectionClaims(s.claims, s.pullStat).length).toBeGreaterThan(0)
        }
      })

      it('every claim carries a valid confidence; confident claims are sourced, weak claims noted', () => {
        for (const s of wing.sections) {
          for (const cl of sectionClaims(s.claims, s.pullStat)) {
            expect(VALID_CONFIDENCE).toContain(cl.confidence)
            if (cl.confidence === 'unverified' || cl.confidence === 'secondhand-attributed') {
              expect(typeof cl.note === 'string' && cl.note.length > 0).toBe(true)
            } else {
              expect(cl.source).toBeTruthy()
            }
          }
        }
      })

      it('every cited source has an http(s) url and a real retrievedAt date', () => {
        for (const s of wing.sections) {
          for (const cl of sectionClaims(s.claims, s.pullStat)) {
            if (cl.source) {
              expect(cl.source.url).toMatch(/^https?:\/\//)
              expect(cl.source.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
              expect(cl.source.label.length).toBeGreaterThan(0)
            }
          }
        }
      })

      it('keeps related links in-app', () => {
        for (const r of wing.related ?? []) {
          expect(r.to).toMatch(/^\//)
          expect(r.label.length).toBeGreaterThan(0)
        }
      })
    })
  }

  it('exposes a well-formed deduped source list for the colophon', () => {
    const sources = knowledgeSources()
    expect(sources.length).toBeGreaterThan(0)
    const urls = sources.map((s) => s.url)
    expect(new Set(urls).size).toBe(urls.length)
    for (const s of sources) {
      expect(s.url).toMatch(/^https?:\/\//)
      expect(s.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
