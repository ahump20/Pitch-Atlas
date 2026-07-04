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

/** A minimal stand-in for the data router: replay navigations to subscribers. */
function makeRouter(initial = '/') {
  let pathname = initial
  const subs = new Set<(s: { location: { pathname: string } }) => void>()
  return {
    state: { location: { get pathname() { return pathname } } },
    subscribe(fn: (s: { location: { pathname: string } }) => void) {
      subs.add(fn)
      return () => subs.delete(fn)
    },
    navigate(next: string) {
      pathname = next
      for (const fn of subs) fn({ location: { pathname } })
    },
  }
}

describe('ReloadPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sw.offlineReady = false
    sw.needRefresh = true
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('renders a slim top banner with accessible reload and dismiss actions', () => {
    render(<ReloadPrompt />)

    expect(screen.getByText('Update ready')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss update prompt/i })).toBeInTheDocument()
    // top-slim, never the bottom bar it used to cover controls with
    expect(screen.getByRole('status')).toHaveClass('top-0')
    expect(screen.getByRole('status')).not.toHaveClass('bottom-0')
  })

  it('shows no prompt on a fresh first install (offlineReady, not needRefresh)', () => {
    sw.offlineReady = true
    sw.needRefresh = false

    render(<ReloadPrompt />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(sw.setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('auto-activates the waiting worker on the next route navigation', () => {
    const router = makeRouter('/')
    render(<ReloadPrompt router={router} />)

    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
    router.navigate('/pitch/four-seam')
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('activates only once even across several navigations', () => {
    const router = makeRouter('/')
    render(<ReloadPrompt router={router} />)

    router.navigate('/a')
    router.navigate('/b')
    router.navigate('/c')
    expect(sw.updateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('does not auto-activate when there is no waiting worker', () => {
    sw.needRefresh = false
    const router = makeRouter('/')
    render(<ReloadPrompt router={router} />)

    router.navigate('/pitch/slider')
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('persists a Later dismissal for the session so it stays gone', () => {
    const { unmount } = render(<ReloadPrompt />)
    screen.getByRole('button', { name: /dismiss update prompt/i }).click()
    expect(sessionStorage.getItem('pa-sw-update-dismissed')).toBe('1')
    unmount()

    // A later mount in the same session (still needRefresh) stays silent.
    render(<ReloadPrompt />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
