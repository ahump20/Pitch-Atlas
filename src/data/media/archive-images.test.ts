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

  for (const image of LOST_PITCH_ARCHIVE_IMAGES) {
    describe(`archive image: ${image.id}`, () => {
      it('never ships a restricted/linked-only image as a hosted file', () => {
        expect(SHIPPABLE_IMAGE_RIGHTS).toContain(image.rights)
      })

      it('keeps its imageSrc inside /archive/ and never escapes the directory', () => {
        expect(image.imageSrc.startsWith('/archive/')).toBe(true)
        expect(image.imageSrc).not.toContain('..')
      })

      it('resolves its rights to a registered provenance Source', () => {
        expect(image.source).toBeTruthy()
        expect(SOURCES[image.source.id as keyof typeof SOURCES]).toBeTruthy()
        expect(image.source.url).toMatch(/^https?:\/\//)
        if (RIGHTS_NEEDING_SOURCE.includes(image.rights)) {
          // a public-domain / licensed image must carry the verifiable origin link
          expect(image.source.url.length).toBeGreaterThan(0)
        }
      })

      it('points at a real file under public/archive/ (no dangling reference)', () => {
        expect(existsSync(join(process.cwd(), 'public', image.imageSrc))).toBe(true)
      })

      it('carries non-empty alt text (zero-WebGL accessibility floor)', () => {
        expect(image.alt.trim().length).toBeGreaterThan(0)
      })
    })
  }
})
