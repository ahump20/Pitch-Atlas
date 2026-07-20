import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServiceWorkerUpdateController } from './ServiceWorkerUpdateController'

const sw = vi.hoisted(() => ({
  updateServiceWorker: vi.fn(),
  setOfflineReady: vi.fn(),
  offlineReady: false,
  needRefresh: true,
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    needRefresh: [sw.needRefresh, vi.fn()],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

/** A minimal stand-in for the data router: replay navigations to subscribers. */
function makeRouter(initial = '/') {
  let pathname = initial
  const subscribers = new Set<(state: { location: { pathname: string } }) => void>()
  return {
    state: {
      location: {
        get pathname() {
          return pathname
        },
      },
    },
    subscribe(fn: (state: { location: { pathname: string } }) => void) {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    },
    navigate(next: string) {
      pathname = next
      for (const fn of subscribers) fn({ location: { pathname } })
    },
  }
}

describe('ServiceWorkerUpdateController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sw.offlineReady = false
    sw.needRefresh = true
  })

  it('renders no update banner or action when a build is waiting', () => {
    const { container } = render(<ServiceWorkerUpdateController />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText(/update ready/i)).not.toBeInTheDocument()
  })

  it('clears the silent saved-offline signal on a fresh install', () => {
    sw.offlineReady = true
    sw.needRefresh = false

    render(<ServiceWorkerUpdateController />)

    expect(sw.setOfflineReady).toHaveBeenCalledWith(false)
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('activates a waiting worker at the next route change', () => {
    const router = makeRouter('/')
    render(<ServiceWorkerUpdateController router={router} />)

    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
    router.navigate('/pitch/four-seam')
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('activates only once across several route changes', () => {
    const router = makeRouter('/')
    render(<ServiceWorkerUpdateController router={router} />)

    router.navigate('/repertoire')
    router.navigate('/pitch/four-seam')
    router.navigate('/about')
    expect(sw.updateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('does nothing at a route change when no worker is waiting', () => {
    sw.needRefresh = false
    const router = makeRouter('/')
    render(<ServiceWorkerUpdateController router={router} />)

    router.navigate('/pitch/slider')
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
  })
})
