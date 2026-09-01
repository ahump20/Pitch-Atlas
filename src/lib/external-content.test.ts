import { describe, expect, it } from 'vitest'
import { validateExternalSuggestion } from './external-content'

describe('external content suggestions', () => {
  it('normalizes a supported public post', () => {
    expect(
      validateExternalSuggestion({
        url: ' https://x.com/PitchingNinja/status/1061649568847269889 ',
        rationale: 'Rivera teaches the cutter grip hand to hand.',
        pitchSlug: 'cutter',
      }),
    ).toEqual({
      platform: 'x',
      externalId: '1061649568847269889',
      canonicalUrl: 'https://x.com/PitchingNinja/status/1061649568847269889',
    })
  })

  it('rejects unsupported hosts and context-free submissions', () => {
    expect(() =>
      validateExternalSuggestion({ url: 'https://example.com/video/1', rationale: 'This belongs here.' }),
    ).toThrow(/public X, Instagram, TikTok, or YouTube/)
    expect(() =>
      validateExternalSuggestion({
        url: 'https://youtu.be/abc123',
        rationale: 'good',
      }),
    ).toThrow(/10 to 300/)
  })
})
