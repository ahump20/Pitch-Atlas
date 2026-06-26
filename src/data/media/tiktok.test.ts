import { describe, expect, it } from 'vitest'
import { TEACHING_CLIPS, teachingClipForSlug, teachingClipsForCraftsman } from './tiktok'

/*
  The one named rights arrangement that intentionally embeds third-party media:
  the TikTok teaching clips ride TikTok's OWN player on web and iOS, credited, with
  an outbound link always present — never a rehosted byte. This guard asserts the
  embed-only contract holds (a player key + a real post URL, no bundled media path)
  and that the deliberately-promoted set is intact, so a regression can neither
  rehost a clip nor silently drop one. The iOS half (teaching-clips.json count ==
  this module's count) is asserted in PitchAtlasTests.
*/

// The deliberately-promoted clips (MEDIA-LEDGER rows T1–T3). Adding/removing one is
// a rights decision, not a silent edit — this list is the gate.
const PROMOTED_IDS = ['ryan-four-two-seam', 'rogers-rising-breaker', 'ncaa-ace-grips']

describe('teaching-clip embed integrity (embed-or-link, never rehost)', () => {
  it('carries exactly the deliberately-promoted clips', () => {
    expect([...TEACHING_CLIPS.map((c) => c.id)].sort()).toEqual([...PROMOTED_IDS].sort())
  })

  for (const clip of TEACHING_CLIPS) {
    describe(`clip: ${clip.id}`, () => {
      it('embeds via the official TikTok player, not a hosted file', () => {
        expect(clip.platform).toBe('tiktok')
        expect(clip.videoId).toMatch(/^\d+$/) // the official player/embed key
        expect(clip.url).toMatch(/^https:\/\/(www\.)?tiktok\.com\//)
        expect(clip.authorUrl).toMatch(/^https:\/\/(www\.)?tiktok\.com\/@/)
      })

      it('references no bundled or rehosted media path', () => {
        const serialized = JSON.stringify(clip)
        expect(serialized).not.toMatch(/\.(mp4|webm|mov|m4v|gif)\b/i)
        expect(serialized).not.toContain('/grips/')
        expect(serialized).not.toContain('public/')
      })

      it('credits its creator and carries a real retrievedAt (no hardcoded freshness)', () => {
        expect(clip.author.startsWith('@')).toBe(true)
        expect(clip.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(clip.slugs.length).toBeGreaterThan(0)
      })
    })
  }

  it('surfaces clips by specimen slug and craftsman without inventing entries', () => {
    expect(teachingClipForSlug('four-seam')?.id).toBe('ryan-four-two-seam')
    expect(teachingClipForSlug('definitely-not-a-pitch')).toBeUndefined()
    expect(teachingClipsForCraftsman('nolan-ryan').map((c) => c.id)).toContain('ryan-four-two-seam')
  })
})
