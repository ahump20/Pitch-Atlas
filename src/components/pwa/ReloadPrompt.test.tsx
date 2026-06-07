import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReloadPrompt } from './ReloadPrompt'

const updateServiceWorker = vi.fn()

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [true, vi.fn()],
    updateServiceWorker,
  }),
}))

describe('ReloadPrompt', () => {
  it('renders accessible reload and dismiss actions when an update is ready', () => {
    render(<ReloadPrompt />)

    expect(screen.getByText('Update ready')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss update prompt/i })).toBeInTheDocument()
  })
})
