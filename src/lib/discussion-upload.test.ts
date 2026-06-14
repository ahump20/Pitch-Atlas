import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadMedia } from './discussion'

const mocks = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  storageFrom: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  insert: vi.fn(),
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
  mocks.storageFrom.mockReturnValue({ upload: mocks.upload, remove: mocks.remove })
  mocks.from.mockReturnValue({ insert: mocks.insert })
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
