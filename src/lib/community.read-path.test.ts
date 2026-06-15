import { describe, it, expect, vi, beforeEach } from 'vitest'
import { friendlyDbError, listNotes, setTried } from './community'
import { listThread, hasAcceptedMediaTerms } from './discussion'

/*
  The no-minting contract for the READ path. Listing notes or a discussion thread
  must never create a Supabase account: the anon role's SELECT grants serve the
  public set, and the live database denies the viewer-scoped tables (note_tries,
  note_helpful, discussion_media_terms) to a sessionless caller — so touching them
  without a session is not just wasteful, it throws. An anonymous account is minted
  on write intent only. These tests pin both directions: reads never sign in or
  touch viewer-scoped tables; a write still signs in first.
*/

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInAnonymously: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
}))

vi.mock('./supabase', () => ({
  COMMUNITY_ENABLED: true,
  supabase: {
    auth: { getSession: mocks.getSession, signInAnonymously: mocks.signInAnonymously },
    from: mocks.from,
    storage: { from: mocks.storageFrom },
  },
}))

/** A thenable PostgREST-style chain that resolves every shape the libs await. */
function chainFor(data: unknown) {
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'in', 'order', 'insert', 'delete', 'update']) {
    chain[m] = () => chain
  }
  chain.maybeSingle = () => Promise.resolve({ data: Array.isArray(data) ? data[0] ?? null : data, error: null })
  chain.single = () => Promise.resolve({ data: Array.isArray(data) ? data[0] ?? null : data, error: null })
  chain.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve({ data, error: null }).then(resolve, reject)
  return chain
}

const NOTE_ROW = {
  id: 'note-1',
  pitch_slug: 'four-seam',
  author_id: 'author-9',
  display_name: 'RHP_threequarter',
  tweak: 'Thumb tucked deeper under the leather.',
  player_level: 'college',
  arm_slot: 'three-quarters',
  velocity_band: null,
  intent: 'more-movement',
  claimed_result_kind: 'worked-in-bullpen',
  claimed_result_note: null,
  sample_size: null,
  evidence_url: null,
  evidence_label: null,
  source_tier: 'community-firsthand',
  note: null,
  adoption_count: 3,
  helpful_count: 2,
  base_rank: 5,
  created_at: '2026-06-01T00:00:00Z',
}

const POST_ROW = {
  id: 'post-1',
  topic_key: 'pitch:four-seam',
  author_id: 'author-9',
  display_name: 'RHP_threequarter',
  parent_id: null,
  body: 'Seam orientation question.',
  created_at: '2026-06-01T00:00:00Z',
}

function tablesQueried(): string[] {
  return mocks.from.mock.calls.map((c) => c[0] as string)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('read path mints no account', () => {
  it('listNotes with no session: no sign-in, no viewer-scoped queries, flags all false', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    mocks.from.mockImplementation((table: string) => chainFor(table === 'field_notes' ? [NOTE_ROW] : []))

    const notes = await listNotes('four-seam')

    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(tablesQueried()).toEqual(['field_notes'])
    expect(notes).toHaveLength(1)
    expect(notes[0].displayName).toBe('RHP_threequarter')
    expect(notes[0].adoptionCount).toBe(3)
    expect(notes[0].viewerTried).toBe(false)
    expect(notes[0].viewerHelpful).toBe(false)
    expect(notes[0].viewerIsAuthor).toBe(false)
  })

  it('listNotes with a session: still no sign-in, viewer flags come from the scoped tables', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation((table: string) => {
      if (table === 'field_notes') return chainFor([NOTE_ROW])
      if (table === 'note_tries') return chainFor([{ note_id: 'note-1' }])
      return chainFor([])
    })

    const notes = await listNotes('four-seam')

    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(tablesQueried()).toEqual(expect.arrayContaining(['field_notes', 'note_tries', 'note_helpful']))
    expect(notes[0].viewerTried).toBe(true)
    expect(notes[0].viewerHelpful).toBe(false)
    expect(notes[0].viewerIsAuthor).toBe(true)
  })

  it('listThread with no session: no sign-in, posts load, viewer owns nothing', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    mocks.from.mockImplementation((table: string) => chainFor(table === 'discussion_posts' ? [POST_ROW] : []))

    const posts = await listThread('pitch:four-seam')

    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(posts).toHaveLength(1)
    expect(posts[0].body).toBe('Seam orientation question.')
    expect(posts[0].viewerIsAuthor).toBe(false)
  })

  it('hasAcceptedMediaTerms with no session: false, without touching the table', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })

    await expect(hasAcceptedMediaTerms()).resolves.toBe(false)
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(mocks.from).not.toHaveBeenCalled()
  })
})

describe('write path still signs in first', () => {
  it('setTried with no session mints the anonymous account before writing', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    mocks.signInAnonymously.mockResolvedValue({ data: { user: { id: 'fresh-anon' } }, error: null })
    mocks.from.mockImplementation(() => chainFor([]))

    await setTried('note-1', true)

    expect(mocks.signInAnonymously).toHaveBeenCalledTimes(1)
    expect(tablesQueried()).toContain('note_tries')
  })
})

describe('community write errors', () => {
  it('keeps trigger-tagged messages but hides raw database errors', () => {
    expect(friendlyDbError({ message: 'content_blocked: keep it clean' })).toBe('keep it clean')
    expect(friendlyDbError({ message: 'duplicate key value violates unique constraint "field_notes_pkey"' })).toBe(
      'Could not save that just now. Try again.',
    )
    expect(friendlyDbError(null)).toBe('Could not save that just now. Try again.')
  })
})
