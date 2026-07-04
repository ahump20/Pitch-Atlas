import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOST_PITCH_ARCHIVE_IMAGES } from './archive-images'
import { SOURCES } from '../sources'
import type { RightsStatus } from '../types'

/*
  Rights gate, made executable. The MEDIA-LEDGER policy is doctrine prose; this is
  the code sentinel that fails the build if an archive image would ship bytes it
  may not. Three failures the gate must catch (the supply-side enabler for every
  archival feature): a restricted/agency image, an imageSrc that escapes the
  archive directory, and rights that cannot resolve to a verified provenance Source.
  Rights and confidence stay orthogonal: rights answers "may we ship", the caption
  carries its own confidence elsewhere.
*/

// Rights under which an archive image may ship a hosted file in public/archive/.
// 'restricted' and 'linked-only' never reproduce a file; 'public-domain' and
// 'licensed' do, but must carry the verifiable origin Source.
const SHIPPABLE_IMAGE_RIGHTS: RightsStatus[] = ['original', 'public-domain', 'licensed']
const RIGHTS_NEEDING_SOURCE: RightsStatus[] = ['public-domain', 'licensed']

describe('archive image rights guard', () => {
  it('ships at least the lost-pitches plates', () => {
    expect(LOST_PITCH_ARCHIVE_IMAGES.length).toBeGreaterThan(0)
  })

  it('files at least one linked-only archival film record', () => {
    const filmCount = LOST_PITCH_ARCHIVE_IMAGES.filter((image) => image.video).length
    expect(filmCount).toBeGreaterThan(0)
  })

  it('allows first-party original plates without an external Source', () => {
    const originals = LOST_PITCH_ARCHIVE_IMAGES.filter((image) => image.rights === 'original')
    expect(originals.length).toBeGreaterThan(0)
    expect(originals.every((image) => !image.source)).toBe(true)
  })

  for (const image of LOST_PITCH_ARCHIVE_IMAGES) {
    describe(`archive image: ${image.id}`, () => {
      it('never ships a restricted/linked-only image as a hosted file', () => {
        expect(SHIPPABLE_IMAGE_RIGHTS).toContain(image.rights)
      })

      it('keeps its imageSrc inside /archive/ and never escapes the directory', () => {
        expect(image.imageSrc.startsWith('/archive/')).toBe(true)
        expect(image.imageSrc).not.toContain('..')
      })

      it('resolves sourced rights to the registered provenance Source', () => {
        if (!image.source) {
          expect(RIGHTS_NEEDING_SOURCE).not.toContain(image.rights)
          return
        }

        const registeredSource = SOURCES[image.source.id as keyof typeof SOURCES]
        expect(registeredSource).toBeTruthy()
        expect(image.source).toMatchObject(registeredSource)

        if (RIGHTS_NEEDING_SOURCE.includes(image.rights)) {
          // a public-domain / licensed image must carry the verifiable origin link
          expect(registeredSource.url).toMatch(/^https?:\/\//)
          expect(registeredSource.url.length).toBeGreaterThan(0)
        }
      })

      it('points at a real file under public/archive/ (no dangling reference)', () => {
        expect(existsSync(join(process.cwd(), 'public', image.imageSrc))).toBe(true)
      })

      it('carries non-empty alt text (zero-WebGL accessibility floor)', () => {
        expect(image.alt.trim().length).toBeGreaterThan(0)
      })

      it('keeps archival film references linked-only, credited, and never bundled', () => {
        if (!image.video) return

        expect(image.video.rights).toBe('linked-only')
        expect(image.video.url).toMatch(/^https?:\/\//)
        expect(image.video.embedUrl).toMatch(/^https?:\/\//)
        expect(image.video.caption.source).toBeTruthy()
        const registeredSource = SOURCES[image.video.caption.source.id as keyof typeof SOURCES]
        expect(registeredSource).toBeTruthy()
        expect(image.video.caption.source).toMatchObject(registeredSource)

        if (image.video.previewSrc) {
          expect(image.rights).toBe('public-domain')
          expect(image.video.previewSrc.startsWith('/archive/')).toBe(true)
          expect(image.video.previewSrc).not.toContain('..')
          expect(existsSync(join(process.cwd(), 'public', image.video.previewSrc))).toBe(true)
        }
      })
    })
  }
})
