import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getViewerMembership, subscribeToViewerMembership } from './membership'

const mocks = vi.hoisted(() => ({
  getSessionUserId: vi.fn(),
  rpc: vi.fn(),
  channel: vi.fn(),
  removeChannel: vi.fn(),
}))

vi.mock('./community', () => ({
  getSessionUserId: mocks.getSessionUserId,
}))

vi.mock('./supabase', () => ({
  supabase: {
    rpc: mocks.rpc,
    channel: mocks.channel,
    removeChannel: mocks.removeChannel,
  },
}))

function makeChannel() {
  const channel = {
    on: vi.fn((..._args: unknown[]) => channel),
    subscribe: vi.fn((..._args: unknown[]) => channel),
  }
  return channel
}

describe('membership data layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('does not mint or query membership for signed-out readers', async () => {
    mocks.getSessionUserId.mockResolvedValue(null)

    await expect(getViewerMembership()).resolves.toBeNull()

    expect(mocks.rpc).not.toHaveBeenCalled()
    expect(mocks.channel).not.toHaveBeenCalled()
  })

  it('maps the viewer membership RPC with response metadata', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T18:42:00.000Z'))
    mocks.getSessionUserId.mockResolvedValue('user-1')
    mocks.rpc.mockResolvedValue({
      data: [{
        user_id: 'user-1',
        tier: 'pro',
        status: 'active',
        source: 'app_store',
        current_period_end: '2026-07-24T18:42:00.000Z',
        is_member: true,
        updated_at: '2026-06-24T18:40:00.000Z',
      }],
      error: null,
    })

    await expect(getViewerMembership()).resolves.toEqual({
      userId: 'user-1',
      tier: 'pro',
      status: 'active',
      source: 'app_store',
      currentPeriodEnd: '2026-07-24T18:42:00.000Z',
      isMember: true,
      updatedAt: '2026-06-24T18:40:00.000Z',
      fetchedAt: '2026-06-24T18:42:00.000Z',
      timezone: 'America/Chicago',
    })
    expect(mocks.rpc).toHaveBeenCalledWith('viewer_membership')
  })

  it('turns membership read errors into stable account copy', async () => {
    mocks.getSessionUserId.mockResolvedValue('user-1')
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'permission denied for table memberships' } })

    await expect(getViewerMembership()).rejects.toThrow('Could not load your member status just now. Try again.')
  })

  it('subscribes only to the viewer membership row and refetches on changes', async () => {
    const channel = makeChannel()
    mocks.channel.mockReturnValue(channel)
    mocks.getSessionUserId.mockResolvedValue('user-1')
    mocks.rpc.mockResolvedValue({
      data: [{
        user_id: 'user-1',
        tier: 'supporter',
        status: 'trialing',
        source: 'stripe',
        current_period_end: null,
        is_member: true,
        updated_at: null,
      }],
      error: null,
    })
    const onChange = vi.fn()
    const onError = vi.fn()

    const unsubscribe = subscribeToViewerMembership('user-1', { onChange, onError })

    expect(mocks.channel).toHaveBeenCalledWith('membership:user-1')
    expect(channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memberships',
        filter: 'user_id=eq.user-1',
      },
      expect.any(Function),
    )

    const changeHandler = channel.on.mock.calls[0][2] as () => void
    changeHandler()
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tier: 'supporter',
        status: 'trialing',
        source: 'stripe',
        isMember: true,
        timezone: 'America/Chicago',
      }),
    ))
    expect(onError).not.toHaveBeenCalled()

    unsubscribe()
    expect(mocks.removeChannel).toHaveBeenCalledWith(channel)
  })
})
