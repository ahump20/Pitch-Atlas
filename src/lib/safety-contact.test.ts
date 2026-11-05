import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ ensureSession: vi.fn(), rpc: vi.fn() }))
vi.mock('./community', () => ({ ensureSession: mocks.ensureSession }))
vi.mock('./supabase', () => ({ supabase: { rpc: mocks.rpc } }))
import { sendSafetyContact } from './safety-contact'

beforeEach(() => {
  vi.resetAllMocks()
  mocks.ensureSession.mockResolvedValue('anonymous-contributor')
})

describe('developer contact', () => {
  it('validates before creating an anonymous session', async () => {
    await expect(sendSafetyContact('short', '')).rejects.toThrow('10 and 4000')
    await expect(sendSafetyContact('A report with enough detail.', 'invalid')).rejects.toThrow('valid reply email')
    expect(mocks.ensureSession).not.toHaveBeenCalled()
  })
  it('counts Unicode code points like the contact RPC', async () => {
    await expect(sendSafetyContact('⚾'.repeat(8), '')).rejects.toThrow('10 and 4000')
    await expect(sendSafetyContact('😀'.repeat(8), '')).rejects.toThrow('10 and 4000')
    mocks.rpc.mockResolvedValue({ data: '12345678-1234-4321-8123-123456789abc', error: null })
    await expect(sendSafetyContact('😀'.repeat(4000), '')).resolves.toBeTypeOf('string')
    await expect(sendSafetyContact('😀'.repeat(4001), '')).rejects.toThrow('10 and 4000')
  })
  it('returns only a server receipt and trims optional contact data', async () => {
    const receipt = '12345678-1234-4321-8123-123456789abc'
    mocks.rpc.mockResolvedValue({ data: receipt, error: null })
    await expect(sendSafetyContact('  Please review this activity.  ', ' reviewer@example.com ')).resolves.toBe(receipt)
    expect(mocks.rpc).toHaveBeenCalledWith('submit_safety_contact', {
      p_message: 'Please review this activity.', p_reply_email: 'reviewer@example.com',
    })
  })
  it('does not claim success or expose raw errors without a receipt', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'private server diagnostic' } })
    await expect(sendSafetyContact('Please review this activity.', '')).rejects.toThrow('not confirmed')
    mocks.rpc.mockResolvedValue({ data: null, error: null })
    await expect(sendSafetyContact('Please review this activity.', '')).rejects.toThrow('not confirmed')
  })
  it('sanitizes session failures before attempting delivery', async () => {
    mocks.ensureSession.mockRejectedValue(new Error('private auth diagnostic'))
    await expect(sendSafetyContact('Please review this activity.', '')).rejects.toThrow('not confirmed')
    expect(mocks.rpc).not.toHaveBeenCalled()
  })
  it('preserves a helpful rate limit response', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'rate_limit: internal detail' } })
    await expect(sendSafetyContact('Please review this activity.', '')).rejects.toThrow('wait before sending')
  })
})
