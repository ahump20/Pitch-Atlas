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

  it('batches media lookups for long discussions', async () => {
    const posts = Array.from({ length: 101 }, (_, index) => ({
      id: `post-${index + 1}`,
      topic_key: 'pitch:four-seam',
      author_id: `user-${index + 1}`,
      display_name: 'Austin',
      parent_id: null,
      body: `Post ${index + 1}`,
      created_at: new Date(Date.UTC(2026, 5, 15, 8, index)).toISOString(),
    }))
    mocks.postsOrder.mockResolvedValue({ data: posts, error: null })

    await listThread('pitch:four-seam')

    expect(mocks.mediaIn).toHaveBeenNthCalledWith(
      1,
      'post_id',
      posts.slice(0, 100).map((post) => post.id),
    )
    expect(mocks.mediaIn).toHaveBeenNthCalledWith(2, 'post_id', ['post-101'])
    expect(mocks.mediaIn).toHaveBeenCalledTimes(2)
  })

  it('batches signed URL creation for media-heavy discussions', async () => {
    const mediaRows = Array.from({ length: 101 }, (_, index) => ({
      id: `media-${index + 1}`,
      post_id: 'post-1',
      storage_path: `user-1/media-${index + 1}.jpg`,
      kind: 'image',
      width: 640,
      height: 480,
    }))
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
    mocks.mediaIn.mockResolvedValue({ data: mediaRows, error: null })
    mocks.createSignedUrls.mockImplementation((paths: string[]) =>
      Promise.resolve({
        data: paths.map((path) => ({ path, signedUrl: `https://media.example/${path}`, error: null })),
        error: null,
      }),
    )

    const [post] = await listThread('pitch:four-seam')

    expect(mocks.createSignedUrls).toHaveBeenNthCalledWith(
      1,
      mediaRows.slice(0, 100).map((row) => row.storage_path),
      3600,
    )
    expect(mocks.createSignedUrls).toHaveBeenNthCalledWith(2, ['user-1/media-101.jpg'], 3600)
    expect(mocks.createSignedUrls).toHaveBeenCalledTimes(2)
    expect(post.media).toHaveLength(101)
    expect(post.media[0].url).toBe('https://media.example/user-1/media-1.jpg')
    expect(post.media[100].url).toBe('https://media.example/user-1/media-101.jpg')
  })

  it('hides raw signed URL errors behind load copy', async () => {
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
      data: [
        {
          id: 'media-1',
          post_id: 'post-1',
          storage_path: 'user-1/media-1.jpg',
          kind: 'image',
          width: 640,
          height: 480,
        },
      ],
      error: null,
    })
    mocks.createSignedUrls.mockResolvedValue({
      data: null,
      error: { message: 'permission denied for bucket discussion-media' },
    })

    await expect(listThread('pitch:four-seam')).rejects.toThrow(
      'Could not load the discussion just now. Try again.',
    )
  })
})
