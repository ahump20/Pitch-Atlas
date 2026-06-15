import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listThread } from './discussion'

const mocks = vi.hoisted(() => ({
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  postsSelect: vi.fn(),
  postsEq: vi.fn(),
  postsOrder: vi.fn(),
  mediaSelect: vi.fn(),
  mediaIn: vi.fn(),
  storageFrom: vi.fn(),
  createSignedUrls: vi.fn(),
}))

vi.mock('./community', () => ({
  ensureSession: vi.fn(),
  getSessionUserId: mocks.getSessionUserId,
}))

vi.mock('./supabase', () => ({
  COMMUNITY_ENABLED: true,
  supabase: {
    from: mocks.from,
    storage: { from: mocks.storageFrom },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getSessionUserId.mockResolvedValue(null)
  mocks.postsOrder.mockResolvedValue({ data: [], error: null })
  mocks.mediaIn.mockResolvedValue({ data: [], error: null })
  mocks.createSignedUrls.mockResolvedValue({ data: [], error: null })
  mocks.storageFrom.mockReturnValue({ createSignedUrls: mocks.createSignedUrls })
  mocks.postsSelect.mockReturnValue({ eq: mocks.postsEq })
  mocks.postsEq.mockReturnValue({ order: mocks.postsOrder })
  mocks.mediaSelect.mockReturnValue({ in: mocks.mediaIn })
  mocks.from.mockImplementation((table: string) => {
    if (table === 'discussion_posts') return { select: mocks.postsSelect }
    if (table === 'discussion_media') return { select: mocks.mediaSelect }
    return { select: vi.fn() }
  })
})

describe('listThread read errors', () => {
  it('hides raw post lookup errors behind load copy', async () => {
    mocks.postsOrder.mockResolvedValue({
      data: null,
      error: { message: 'permission denied for table discussion_posts' },
    })

    await expect(listThread('pitch:four-seam')).rejects.toThrow(
      'Could not load the discussion just now. Try again.',
    )
  })

  it('hides raw media lookup errors behind load copy', async () => {
    mocks.postsOrder.mockResolvedValue({
      data: [
        {
          id: 'post-1',
          topic_key: 'pitch:four-seam',
          author_id: 'user-1',
          display_name: 'Austin',
          parent_id: null,
          body: 'Try it lower on the horseshoe.',
          created_at: '2026-06-15T08:00:00.000Z',
        },
      ],
      error: null,
    })
    mocks.mediaIn.mockResolvedValue({
      data: null,
      error: { message: 'permission denied for table discussion_media' },
    })

    await expect(listThread('pitch:four-seam')).rejects.toThrow(
      'Could not load the discussion just now. Try again.',
    )
    expect(mocks.mediaIn).toHaveBeenCalledWith('post_id', ['post-1'])
  })
})
