import { describe, it, expect } from 'vitest'
import { AUSTIN_GRIPS, GRIP_PHOTO_PROOF_LIMIT, gripEntryFor, gripPhotosFor } from './index'
import { PITCHES } from '../pitches'
import type { VisualReference } from '../types'

/*
  The visual grip library, enforced in data. A grip photo only ships if it is
  labeled (alt + caption), pointed at a real path under /grips/, and cleanly
  sourced for its channel: owned-outright photos need no attribution, every other
  channel must name who to credit and link the rights. The filed specimens must
  actually expose their photos. File-on-disk existence is verified at build/preview
  (the SSG render and the live load), not here, since the unit tier has no node fs
  types. An unlabeled, mis-channeled, duplicated, or unwired image fails the build.
*/

const ALL_PHOTOS: VisualReference[] = AUSTIN_GRIPS.flatMap((g) => g.photos)

const VALID_KINDS = ['first-party', 'community', 'creative-commons', 'public-domain', 'licensed']
const VALID_VIEWS = ['top', 'side', 'thumb']

describe('grip library data', () => {
  it('has grips, each with a note and either photos or a note-only state', () => {
    expect(AUSTIN_GRIPS.length).toBeGreaterThan(0)
    for (const g of AUSTIN_GRIPS) {
      if (g.photoStatus === 'note-only') {
        expect(g.photos.length, `${g.label} should stay note-only`).toBe(0)
      } else {
        expect(g.photos.length, `${g.label} has no photos`).toBeGreaterThan(0)
      }
      expect(g.note.trim().length, `${g.label} has no note`).toBeGreaterThan(0)
      expect(g.shortCue.trim().length, `${g.label} has no short cue`).toBeGreaterThan(0)
      expect(g.visibleCue.trim().length, `${g.label} has no visible cue`).toBeGreaterThan(0)
      expect(g.claimTier, `${g.label} has the wrong claim lane`).toBe('pitcher-own-words')
      expect(g.proofLimit, `${g.label} has the wrong proof boundary`).toBe(GRIP_PHOTO_PROOF_LIMIT)
      expect(g.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('keeps circle change as Austin note-only evidence', () => {
    const circle = gripEntryFor('circle-change')
    expect(circle?.photoStatus).toBe('note-only')
    expect(circle?.photos).toHaveLength(0)
    expect(circle?.note).toContain('hands were too small')
  })

  it('keeps grip-photo proof limits away from measured claims', () => {
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('does not prove tracked speed')
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('spin')
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('shape')
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('command')
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('injury risk')
    expect(GRIP_PHOTO_PROOF_LIMIT).toContain('outcome')
  })

  it('links every grip to a real home (specimen or repertoire id)', () => {
    for (const g of AUSTIN_GRIPS) {
      expect(
        Boolean(g.specimenSlug || g.repertoireId),
        `${g.label} has no specimen or repertoire link`,
      ).toBe(true)
    }
  })

  for (const photo of ALL_PHOTOS) {
    describe(photo.src, () => {
      it('is fully labeled and lives under /grips/', () => {
        expect(photo.alt.trim().length, 'alt is required for the accessibility floor').toBeGreaterThan(0)
        expect(photo.caption.trim().length, 'caption is required').toBeGreaterThan(0)
        expect(photo.src.startsWith('/grips/'), 'grip photos live under /grips/').toBe(true)
        expect(photo.src.endsWith('.webp'), 'grip photos are optimized webp').toBe(true)
        expect(VALID_KINDS).toContain(photo.kind)
        if (photo.view) expect(VALID_VIEWS).toContain(photo.view)
      })

      it('carries rights appropriate to its channel', () => {
        expect(photo.rights.length).toBeGreaterThan(0)
        if (photo.kind !== 'first-party' && photo.kind !== 'public-domain') {
          // community / creative-commons / licensed must name credit and link rights
          expect(
            photo.attribution?.trim().length,
            `${photo.src} (${photo.kind}) needs attribution`,
          ).toBeGreaterThan(0)
          expect(photo.source, `${photo.src} (${photo.kind}) needs a rights source`).toBeTruthy()
        }
      })
    })
  }

  it('uses each image file only once', () => {
    const srcs = ALL_PHOTOS.map((p) => p.src)
    expect(new Set(srcs).size).toBe(srcs.length)
  })
})

describe('filed specimens expose their real grip photos', () => {
  // Austin's own filed pitches. The generic splitter specimen is intentionally NOT
  // here: his split-finger fastball is filed as his own pitch (repertoire
  // 'split-finger-fastball' / grips 'split-finger'), never on the offspeed "Splitter".
  const FILED = ['four-seam', 'two-seam', 'twelve-six']
  for (const slug of FILED) {
    it(`${slug} resolves grip photos and wires canonical.gripImages`, () => {
      expect(gripPhotosFor(slug).length, `${slug} has no grip photos`).toBeGreaterThan(0)
      const entry = PITCHES.find((e) => e.display.slug === slug)
      expect(entry, `no specimen for ${slug}`).toBeTruthy()
      expect(entry?.canonical.gripImages?.length, `${slug} canonical.gripImages not wired`).toBeGreaterThan(0)
    })
  }
})
