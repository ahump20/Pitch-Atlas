import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SQL = readFileSync(
  join(process.cwd(), 'supabase/migrations/20260831230000_external_content_living_media.sql'),
  'utf8',
)

describe('external content database contract', () => {
  it('makes only reviewed, non-removed items publicly readable', () => {
    expect(SQL).toMatch(/published external content is public[\s\S]*moderation_state = 'published'[\s\S]*availability <> 'removed'/)
    expect(SQL).toMatch(/grant select on table public\.external_content_items to anon, authenticated/)
  })

  it('keeps suggestions authenticated, owner-bound, and rate limited', () => {
    expect(SQL).toMatch(
      /for insert to authenticated[\s\S]*submitted_by = \(select auth\.uid\(\)\)[\s\S]*review_state = 'pending'/,
    )
    expect(SQL).toMatch(/v_recent >= 5/)
    expect(SQL).not.toMatch(/grant (?:all|update|delete).*external_content_suggestions.*anon/i)
  })

  it('stores canonical references rather than third-party media payloads', () => {
    expect(SQL).toContain('canonical_url')
    expect(SQL).not.toMatch(/oembed_(?:html|payload|json)|media_bytes|video_blob/i)
  })
})
