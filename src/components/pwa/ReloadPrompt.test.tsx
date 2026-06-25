import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReloadPrompt } from './ReloadPrompt'

const sw = vi.hoisted(() => ({
  updateServiceWorker: vi.fn(),
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  offlineReady: false,
  needRefresh: true,
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('ReloadPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    sw.offlineReady = false
    sw.needRefresh = true
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders accessible reload and dismiss actions when an update is ready', () => {
    render(<ReloadPrompt />)

    expect(screen.getByText('Update ready')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss update prompt/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('data-blaze-reserved-bottom')
    expect(screen.getByRole('status')).toHaveClass('bottom-0')
  })

  it('clears the saved-offline event without rendering a blocking notice', () => {
    sw.offlineReady = true
    sw.needRefresh = false

    render(<ReloadPrompt />)

    expect(screen.queryByText('Saved offline')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(sw.setOfflineReady).toHaveBeenCalledWith(false)
  })
})
