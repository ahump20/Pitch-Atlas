import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  claimWithEmail,
  friendlyDbError,
  friendlyReadError,
  getIdentity,
  listNotes,
  setHelpful,
  setTried,
} from './community'
import { listThread, hasAcceptedMediaTerms } from './discussion'

/*
  The no-minting contract for the READ path. Listing notes or a discussion thread
  must never create a Supabase account: the anon role's SELECT grants serve the
  public set, and the live database denies viewer-scoped table reads to a
  sessionless caller. Viewer flags go through narrow RPCs only when a session
  already exists. An anonymous account is minted on write intent only. These
  tests pin both directions: reads never sign in or touch viewer-scoped tables;
  a write still signs in first.
*/

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInAnonymously: vi.fn(),
  updateUser: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  storageFrom: vi.fn(),
}))

vi.mock('./supabase', () => ({
  COMMUNITY_ENABLED: true,
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInAnonymously: mocks.signInAnonymously,
      updateUser: mocks.updateUser,
    },
    from: mocks.from,
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
  },
}))

/** A thenable PostgREST-style chain that resolves every shape the libs await. */
function chainFor(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'eq', 'in', 'order', 'insert', 'delete', 'update']) {
    chain[m] = () => chain
  }
  chain.maybeSingle = () => Promise.resolve({ data: Array.isArray(data) ? data[0] ?? null : data, error })
  chain.single = () => Promise.resolve({ data: Array.isArray(data) ? data[0] ?? null : data, error })
  chain.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve({ data, error }).then(resolve, reject)
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

  it('listNotes treats session lookup failure as signed-out instead of minting a user', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'AuthApiError: token refresh failed' },
    })
    mocks.from.mockImplementation((table: string) => chainFor(table === 'field_notes' ? [NOTE_ROW] : []))

    const notes = await listNotes('four-seam')

    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(tablesQueried()).toEqual(['field_notes'])
    expect(notes[0].viewerTried).toBe(false)
    expect(notes[0].viewerHelpful).toBe(false)
    expect(notes[0].viewerIsAuthor).toBe(false)
  })

  it('listNotes with a session: still no sign-in, viewer flags come from the scoped RPC', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation((table: string) => {
      if (table === 'field_notes') return chainFor([NOTE_ROW])
      return chainFor([])
    })
    mocks.rpc.mockResolvedValue({ data: [{ note_id: 'note-1', tried: true, helpful: false }], error: null })

    const notes = await listNotes('four-seam')

    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(tablesQueried()).toEqual(['field_notes'])
    expect(mocks.rpc).toHaveBeenCalledWith('viewer_note_engagement')
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
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('hasAcceptedMediaTerms with a session uses the RPC, not direct table reads', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
    mocks.rpc.mockResolvedValue({ data: true, error: null })

    await expect(hasAcceptedMediaTerms()).resolves.toBe(true)
    expect(mocks.rpc).toHaveBeenCalledWith('has_accepted_media_terms')
    expect(mocks.from).not.toHaveBeenCalledWith('discussion_media_terms')
  })

  it('hides raw field note lookup errors behind load copy', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    mocks.from.mockImplementation((table: string) =>
      chainFor(table === 'field_notes' ? null : [], { message: 'permission denied for table field_notes' }),
    )

    await expect(listNotes('four-seam')).rejects.toThrow('Could not load community notes just now. Try again.')
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
  })

  it('hides raw engagement RPC errors behind load copy', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation((table: string) => chainFor(table === 'field_notes' ? [NOTE_ROW] : []))
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'permission denied for function viewer_note_engagement' } })

    await expect(listNotes('four-seam')).rejects.toThrow('Could not load community notes just now. Try again.')
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
  })

  it('hides raw profile lookup errors behind load copy', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation((table: string) =>
      chainFor(table === 'profiles' ? null : [], { message: 'permission denied for table profiles' }),
    )

    await expect(getIdentity()).rejects.toThrow('Could not load community notes just now. Try again.')
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
  it('keeps read failures generic', () => {
    expect(friendlyReadError({ message: 'permission denied for table field_notes' })).toBe(
      'Could not load community notes just now. Try again.',
    )
    expect(friendlyReadError(null)).toBe('Could not load community notes just now. Try again.')
  })

  it('keeps trigger-tagged messages but hides raw database errors', () => {
    expect(friendlyDbError({ message: 'content_blocked: keep it clean' })).toBe('keep it clean')
    expect(friendlyDbError({ message: 'duplicate key value violates unique constraint "field_notes_pkey"' })).toBe(
      'Could not save that just now. Try again.',
    )
    expect(friendlyDbError(null)).toBe('Could not save that just now. Try again.')
  })

  it('hides raw Tried This write errors', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation(() => chainFor(null, { message: 'permission denied for table note_tries' }))

    await expect(setTried('note-1', true)).rejects.toThrow('Could not save that just now. Try again.')
  })

  it('hides raw Helpful write errors', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } } })
    mocks.from.mockImplementation(() => chainFor(null, { message: 'permission denied for table note_helpful' }))

    await expect(setHelpful('note-1', false)).rejects.toThrow('Could not save that just now. Try again.')
  })

  it('hides raw anonymous sign-in errors on write intent', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.signInAnonymously.mockResolvedValue({
      data: { user: null },
      error: { message: 'AuthApiError: anonymous sign-ins disabled for this project' },
    })

    await expect(setTried('note-1', true)).rejects.toThrow(
      'Could not start your community session just now. Try again.',
    )
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('does not create a replacement anonymous account when session lookup fails on write intent', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'AuthApiError: token refresh failed' },
    })

    await expect(setHelpful('note-1', true)).rejects.toThrow(
      'Could not start your community session just now. Try again.',
    )
    expect(mocks.signInAnonymously).not.toHaveBeenCalled()
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('hides raw email-claim auth errors', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: 'author-9' } } }, error: null })
    mocks.updateUser.mockResolvedValue({
      data: null,
      error: { message: 'AuthApiError: For security purposes, you can only request this once every 60 seconds' },
    })

    await expect(claimWithEmail('person@example.com')).rejects.toThrow(
      'Could not send the claim email just now. Try again.',
    )
  })
})
