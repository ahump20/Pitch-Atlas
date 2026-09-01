import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const WORKER = readFileSync(
  join(process.cwd(), 'workers/external-content-sync/src/index.ts'),
  'utf8',
)

describe('external content sync worker', () => {
  it('uses official provider APIs and never downloads media bytes', () => {
    expect(WORKER).toContain('https://api.x.com/2/users/')
    expect(WORKER).toContain('https://www.googleapis.com/youtube/v3/playlistItems')
    expect(WORKER).not.toMatch(/video\.twimg|\.mp4|download_location|images\.instagram/i)
  })

  it('requires allowlisting plus a pitch tag for automatic publication', () => {
    expect(WORKER).toContain("source.auto_publish && hasPitchTag ? 'published' : 'pending'")
  })

  it('keeps provider credentials in Worker secrets', () => {
    expect(WORKER).toContain('X_BEARER_TOKEN?: string')
    expect(WORKER).toContain('YOUTUBE_API_KEY?: string')
    expect(WORKER).not.toMatch(/Bearer [A-Za-z0-9_-]{20,}/)
  })
})
