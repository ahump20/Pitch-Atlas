import { beforeEach, describe, expect, it, vi } from 'vitest'
import { acceptMediaTerms, deletePost, uploadMedia } from './discussion'

const mocks = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
  rpc: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  insert: vi.fn(),
  selectMedia: vi.fn(),
  mediaIn: vi.fn(),
  mediaEq: vi.fn(),
  mediaMaybeSingle: vi.fn(),
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
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
  },
}))

function fileFrom(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.ensureSession.mockResolvedValue('user-1')
  mocks.rpc.mockResolvedValue({ error: null })
  mocks.upload.mockResolvedValue({ error: null })
  mocks.remove.mockResolvedValue({ error: null })
  mocks.insert.mockResolvedValue({ error: null })
  mocks.mediaIn.mockResolvedValue({ data: [], error: null })
  mocks.mediaMaybeSingle.mockResolvedValue({ data: null, error: null })
  mocks.postEq.mockResolvedValue({ data: [], error: null })
  mocks.deleteEq.mockResolvedValue({ error: null })
  mocks.storageFrom.mockReturnValue({ upload: mocks.upload, remove: mocks.remove })
  mocks.mediaEq.mockReturnValue({ maybeSingle: mocks.mediaMaybeSingle })
  mocks.selectMedia.mockReturnValue({ in: mocks.mediaIn, eq: mocks.mediaEq })
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
    expect(mocks.rpc).toHaveBeenCalledWith('reserve_discussion_media_upload', {
      p_storage_path: path,
    })
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.upload.mock.invocationCallOrder[0])

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
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('does not upload when the database refuses the path reservation', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.rpc.mockResolvedValueOnce({ error: { message: 'media_blocked: upload path already exists' } })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('upload path already exists')

    expect(mocks.upload).not.toHaveBeenCalled()
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('releases the reservation after a concrete Storage 4xx without granting client cleanup access', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.upload.mockResolvedValue({
      error: { message: 'invalid upload', status: 400, statusCode: 'InvalidRequest' },
    })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('Could not save that just now. Try again.')

    const [path] = mocks.upload.mock.calls[0]
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).toHaveBeenCalledWith('release_discussion_media_upload', {
      p_storage_path: path,
    })
  })

  it('retains the reservation when a Storage response is ambiguous', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.upload.mockResolvedValue({
      error: { message: 'storage unavailable', status: 503, statusCode: 'ServiceUnavailable' },
    })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('Could not save that just now. Try again.')

    expect(mocks.insert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('releases a rowless reservation after a concrete media-row rejection', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'rate_limit: slow down', code: 'P0001' },
      status: 400,
    })

    await expect(uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain'))).rejects.toThrow(
      'slow down',
    )

    const [path] = mocks.upload.mock.calls[0]
    expect(mocks.selectMedia).toHaveBeenCalledWith('id')
    expect(mocks.mediaEq).toHaveBeenCalledWith('storage_path', path)
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).toHaveBeenCalledWith('release_discussion_media_upload', {
      p_storage_path: path,
    })
  })

  it('preserves the original row error when best-effort reservation release fails', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'rate_limit: slow down', code: 'P0001' },
      status: 400,
    })
    mocks.rpc
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'reservation release unavailable' } })

    // The insert error is the cause the contributor needs; a failed best-effort
    // release must not replace it. Expiry remains the backstop.
    await expect(uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain'))).rejects.toThrow(
      'slow down',
    )

    const [path] = mocks.upload.mock.calls[0]
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).toHaveBeenCalledWith('release_discussion_media_upload', {
      p_storage_path: path,
    })
  })

  it('treats an existing row as success after a concrete insert rejection response', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'duplicate response', code: '23505' },
      status: 409,
    })
    mocks.mediaMaybeSingle.mockResolvedValue({ data: { id: 'media-1' }, error: null })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).resolves.toBeUndefined()

    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('leaves the reservation and object intact when row presence cannot be checked', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'rate_limit: slow down', code: 'P0001' },
      status: 400,
    })
    mocks.mediaMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'permission denied for discussion_media lookup' },
    })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('slow down')

    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('does not inspect or release after a status-0 PostgREST outcome', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'Failed to fetch', code: '' },
      status: 0,
    })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('Could not save that just now. Try again.')

    expect(mocks.selectMedia).not.toHaveBeenCalledWith('id')
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('does not inspect or release after a PostgREST 5xx outcome', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockResolvedValue({
      error: { message: 'gateway response failed', code: 'PGRST000' },
      status: 503,
    })

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('Could not save that just now. Try again.')

    expect(mocks.selectMedia).not.toHaveBeenCalledWith('id')
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
  })

  it('leaves the reservation and object intact when the insert outcome throws', async () => {
    const webm = [0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]
    mocks.insert.mockRejectedValue(new Error('connection reset after request'))

    await expect(
      uploadMedia('post-1', 'pitch:four-seam', fileFrom(webm, 'clip.txt', 'text/plain')),
    ).rejects.toThrow('connection reset after request')

    expect(mocks.selectMedia).not.toHaveBeenCalledWith('id')
    expect(mocks.remove).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalledWith('release_discussion_media_upload', expect.anything())
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

    expect(mocks.selectPosts).toHaveBeenCalledWith('id, author_id')
    expect(mocks.postEq).toHaveBeenCalledWith('parent_id', 'post-1')
    expect(mocks.selectMedia).toHaveBeenCalledWith('storage_path')
    expect(mocks.mediaIn).toHaveBeenCalledWith('post_id', ['post-1'])
    expect(mocks.deletePost).toHaveBeenCalled()
    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 'post-1')
    expect(mocks.remove).toHaveBeenCalledWith(['user-1/photo.jpg', 'user-1/clip.webm'])
  })

  it('removes owned media from replies that the post delete cascades', async () => {
    mocks.postEq.mockResolvedValue({
      data: [{ id: 'reply-1', author_id: 'user-1' }, { id: 'reply-2', author_id: 'user-1' }],
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

  it('does not delete a post that has replies from another contributor', async () => {
    mocks.postEq.mockResolvedValue({
      data: [{ id: 'reply-1', author_id: 'other-user' }],
      error: null,
    })

    await expect(deletePost('post-1')).rejects.toThrow(
      'That post has replies from other contributors, so it cannot be deleted.',
    )

    expect(mocks.mediaIn).not.toHaveBeenCalled()
    expect(mocks.deletePost).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('allows deletion when a reply has a null author_id (orphaned, not a contributor)', async () => {
    mocks.postEq.mockResolvedValue({
      data: [{ id: 'reply-1', author_id: null }],
      error: null,
    })
    mocks.mediaIn.mockResolvedValue({ data: [], error: null })

    // A null author_id is an anonymous-cleaned/orphaned reply, not a living
    // contributor — it must not block the author from deleting their own post.
    await expect(deletePost('post-1')).resolves.toBeUndefined()
    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 'post-1')
  })

  it('batches media lookups when a deleted post has many replies', async () => {
    const replies = Array.from({ length: 100 }, (_, index) => ({
      id: `reply-${index + 1}`,
      author_id: 'user-1',
    }))
    mocks.postEq.mockResolvedValue({ data: replies, error: null })
    mocks.mediaIn.mockResolvedValue({ data: [], error: null })

    await deletePost('post-1')

    expect(mocks.mediaIn).toHaveBeenNthCalledWith(
      1,
      'post_id',
      ['post-1', ...replies.slice(0, 99).map((row) => row.id)],
    )
    expect(mocks.mediaIn).toHaveBeenNthCalledWith(2, 'post_id', ['reply-100'])
    expect(mocks.mediaIn).toHaveBeenCalledTimes(2)
  })

  it('batches storage removals for media-heavy deleted discussions', async () => {
    const mediaRows = Array.from({ length: 101 }, (_, index) => ({
      storage_path: `user-1/media-${index + 1}.jpg`,
    }))
    mocks.mediaIn.mockResolvedValue({ data: mediaRows, error: null })

    await deletePost('post-1')

    expect(mocks.remove).toHaveBeenNthCalledWith(
      1,
      mediaRows.slice(0, 100).map((row) => row.storage_path),
    )
    expect(mocks.remove).toHaveBeenNthCalledWith(2, ['user-1/media-101.jpg'])
    expect(mocks.remove).toHaveBeenCalledTimes(2)
  })

  it('does not remove storage when the database delete is rejected', async () => {
    mocks.mediaIn.mockResolvedValue({ data: [{ storage_path: 'user-1/photo.jpg' }], error: null })
    mocks.deleteEq.mockResolvedValue({ error: { message: 'not allowed' } })

    await expect(deletePost('post-1')).rejects.toThrow('Could not save that just now. Try again.')

    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('still resolves when the post is deleted but best-effort storage cleanup fails', async () => {
    mocks.mediaIn.mockResolvedValue({ data: [{ storage_path: 'user-1/photo.jpg' }], error: null })
    mocks.remove.mockResolvedValue({ error: { message: 'permission denied for bucket discussion-media' } })

    // The row is gone — that is the user-visible outcome. A failed storage sweep
    // leaves orphaned bytes for separate cleanup but must not surface a false error.
    await expect(deletePost('post-1')).resolves.toBeUndefined()

    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 'post-1')
    expect(mocks.remove).toHaveBeenCalledWith(['user-1/photo.jpg'])
  })
})

describe('acceptMediaTerms', () => {
  it('records acceptance through the database RPC without exposing table writes', async () => {
    await acceptMediaTerms()

    expect(mocks.ensureSession).toHaveBeenCalled()
    expect(mocks.rpc).toHaveBeenCalledWith('accept_media_terms')
    expect(mocks.from).not.toHaveBeenCalledWith('discussion_media_terms')
    expect(mocks.insert).not.toHaveBeenCalledWith(expect.objectContaining({ accepted_at: expect.anything() }))
  })
})
