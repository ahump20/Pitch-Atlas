import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deletePost, uploadMedia } from './discussion'

const mocks = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  insert: vi.fn(),
  selectMedia: vi.fn(),
  mediaIn: vi.fn(),
  selectPosts: vi.fn(),
  postEq: vi.fn(),
  deletePost: vi.fn(),
  deleteEq: vi.fn(),
}))

vi.mock('./community', () => ({
  ensureSession: mocks.ensureSession,
  getSessionUserId: mocks.getSessionUserId,
}))

vi.mock('./supabase', () => ({
  COMMUNITY_ENABLED: true,
  supabase: {
    from: mocks.from,
    storage: { from: mocks.storageFrom },
  },
}))

function fileFrom(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.ensureSession.mockResolvedValue('user-1')
  mocks.upload.mockResolvedValue({ error: null })
  mocks.remove.mockResolvedValue({ error: null })
  mocks.insert.mockResolvedValue({ error: null })
  mocks.mediaIn.mockResolvedValue({ data: [], error: null })
  mocks.postEq.mockResolvedValue({ data: [], error: null })
  mocks.deleteEq.mockResolvedValue({ error: null })
  mocks.storageFrom.mockReturnValue({ upload: mocks.upload, remove: mocks.remove })
  mocks.selectMedia.mockReturnValue({ in: mocks.mediaIn })
  mocks.selectPosts.mockReturnValue({ eq: mocks.postEq })
  mocks.deletePost.mockReturnValue({ eq: mocks.deleteEq })
  mocks.from.mockImplementation((table: string) => {
    if (table === 'discussion_media') {
      return { insert: mocks.insert, select: mocks.selectMedia }
    }
    if (table === 'discussion_posts') {
      return { select: mocks.selectPosts, delete: mocks.deletePost }
    }
    return { insert: mocks.insert }
  })
})

describe('uploadMedia', () => {
  it('stores media with byte-derived MIME and extension when the declared type lies', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]

    await uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain'))

    const [path, , options] = mocks.upload.mock.calls[0]
    expect(path).toMatch(/^user-1\/.+\.webm$/)
    expect(options).toMatchObject({ contentType: 'video/webm', upsert: false })

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        post_id: 'post-1',
        topic_key: 'pitch:four-seam',
        storage_path: path,
        mime_type: 'video/webm',
        kind: 'video',
        byte_size: 8,
      }),
    )
  })
})

describe('deletePost', () => {
  it('removes owned media objects after the authored post is deleted', async () => {
    mocks.mediaIn.mockResolvedValue({
      data: [
        { storage_path: 'user-1/photo.jpg' },
        { storage_path: 'user-1/clip.webm' },
        { storage_path: 'other-user/reply.jpg' },
        { storage_path: null },
      ],
      error: null,
    })

    await deletePost('post-1')

    expect(mocks.selectPosts).toHaveBeenCalledWith('id')
    expect(mocks.postEq).toHaveBeenCalledWith('parent_id', 'post-1')
    expect(mocks.selectMedia).toHaveBeenCalledWith('storage_path')
    expect(mocks.mediaIn).toHaveBeenCalledWith('post_id', ['post-1'])
    expect(mocks.deletePost).toHaveBeenCalled()
    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 'post-1')
    expect(mocks.remove).toHaveBeenCalledWith(['user-1/photo.jpg', 'user-1/clip.webm'])
  })

  it('removes owned media from replies that the post delete cascades', async () => {
    mocks.postEq.mockResolvedValue({
      data: [{ id: 'reply-1' }, { id: 'reply-2' }],
      error: null,
    })
    mocks.mediaIn.mockResolvedValue({
      data: [
        { storage_path: 'user-1/parent.jpg' },
        { storage_path: 'user-1/reply.jpg' },
        { storage_path: 'other-user/reply.jpg' },
      ],
      error: null,
    })

    await deletePost('post-1')

    expect(mocks.mediaIn).toHaveBeenCalledWith('post_id', ['post-1', 'reply-1', 'reply-2'])
    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 'post-1')
    expect(mocks.remove).toHaveBeenCalledWith(['user-1/parent.jpg', 'user-1/reply.jpg'])
  })

  it('does not remove storage when the database delete is rejected', async () => {
    mocks.mediaIn.mockResolvedValue({ data: [{ storage_path: 'user-1/photo.jpg' }], error: null })
    mocks.deleteEq.mockResolvedValue({ error: { message: 'not allowed' } })

    await expect(deletePost('post-1')).rejects.toThrow('not allowed')

    expect(mocks.remove).not.toHaveBeenCalled()
  })
})
