import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPost } from './discussion'

const mocks = vi.hoisted(() => ({
  ensureSession: vi.fn(),
  getSessionUserId: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  storageFrom: vi.fn(),
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

type ChainResult = {
  data: unknown
  error: unknown
}

function chainFor(result: ChainResult) {
  const chain = {
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: ChainResult) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return chain
}

function newPost() {
  return {
    topicKey: 'pitch:four-seam',
    displayName: 'RHP_threequarter',
    body: 'Seam orientation question.',
    parentId: null,
  }
}

describe('discussion write path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.ensureSession.mockResolvedValue('user-1')
  })

  it('saves the profile handle before inserting a discussion post', async () => {
    const profileChain = chainFor({ data: null, error: null })
    const postChain = chainFor({ data: { id: 'post-1' }, error: null })
    mocks.from.mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      if (table === 'discussion_posts') return postChain
      return chainFor({ data: null, error: null })
    })

    await expect(createPost(newPost())).resolves.toBe('post-1')

    expect(profileChain.update).toHaveBeenCalledWith({ display_name: 'RHP_threequarter' })
    expect(profileChain.eq).toHaveBeenCalledWith('id', 'user-1')
    expect(postChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        topic_key: 'pitch:four-seam',
        display_name: 'RHP_threequarter',
        body: 'Seam orientation question.',
      }),
    )
  })

  it('does not insert a discussion post when the profile write fails', async () => {
    const profileChain = chainFor({
      data: null,
      error: { message: 'permission denied for table profiles' },
    })
    const postChain = chainFor({ data: { id: 'post-1' }, error: null })
    mocks.from.mockImplementation((table: string) => {
      if (table === 'profiles') return profileChain
      if (table === 'discussion_posts') return postChain
      return chainFor({ data: null, error: null })
    })

    await expect(createPost(newPost())).rejects.toThrow('Could not save that just now. Try again.')

    expect(postChain.insert).not.toHaveBeenCalled()
  })
})
