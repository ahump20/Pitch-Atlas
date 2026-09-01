import { describe, expect, it } from 'vitest'
import {
  EXTERNAL_CONTENT_ITEMS,
  externalContentFor,
  externalIdFromUrl,
  officialEmbedUrl,
  platformFromUrl,
} from './external'

describe('external pitching media', () => {
  it.each([
    ['https://x.com/PitchingNinja/status/1061649568847269889', 'x', '1061649568847269889'],
    ['https://www.tiktok.com/@pitchingninja/video/6958820538441600262', 'tiktok', '6958820538441600262'],
    ['https://www.instagram.com/reel/CODE123/', 'instagram', 'CODE123'],
    ['https://youtu.be/abc123', 'youtube', 'abc123'],
  ])('parses an approved provider URL', (url, platform, id) => {
    expect(platformFromUrl(url)).toBe(platform)
    expect(externalIdFromUrl(url)).toBe(id)
  })

  it('rejects an unrelated or malformed URL', () => {
    expect(platformFromUrl('https://example.com/video/123')).toBeNull()
    expect(platformFromUrl('not a URL')).toBeNull()
  })

  it('returns only published, available, route-relevant items', () => {
    const items = externalContentFor({ pitchSlug: 'cutter', limit: 4 })
    expect(items.map((item) => item.id)).toEqual(
      expect.arrayContaining(['rivera-cutter-teaching', 'pedro-cutter-grip']),
    )
    expect(items.every((item) => item.moderationState === 'published')).toBe(true)
  })

  it('builds privacy-minded official embed URLs', () => {
    const x = EXTERNAL_CONTENT_ITEMS.find((item) => item.platform === 'x')
    const tiktok = EXTERNAL_CONTENT_ITEMS.find((item) => item.platform === 'tiktok')
    expect(x && officialEmbedUrl(x)).toContain('dnt=true')
    expect(tiktok && officialEmbedUrl(tiktok)).toContain('autoplay=0')
  })
})
