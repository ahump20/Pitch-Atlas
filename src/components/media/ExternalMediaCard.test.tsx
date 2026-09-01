import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EXTERNAL_CONTENT_ITEMS } from '../../data/media/external'
import { PipProvider } from '../embeds/pip'
import { ExternalMediaCard } from './ExternalMediaCard'

const fixture = EXTERNAL_CONTENT_ITEMS.find((candidate) => candidate.platform === 'x')
if (!fixture) throw new Error('Expected an X media fixture')
const item = fixture

let intersectionCallback: IntersectionObserverCallback

class TestIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '300px 0px'
  readonly scrollMargin = '0px'
  readonly thresholds = [0]
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback
  }
  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn(() => [])
  unobserve = vi.fn()
}

beforeEach(() => {
  window.sessionStorage.clear()
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
  Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: false } })
})

afterEach(() => {
  window.sessionStorage.clear()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(navigator, 'connection')
})

function renderCard() {
  return render(<PipProvider><ExternalMediaCard item={item} /></PipProvider>)
}

describe('ExternalMediaCard loading contract', () => {
  it('does not initialize an official provider until the 300px observer boundary', async () => {
    const { container } = renderCard()
    expect(container.querySelector('iframe')).toBeNull()

    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
    expect(container.querySelector('iframe')).toHaveAttribute('src', expect.stringContaining('dnt=true'))
  })

  it('falls back to a credited source link when the provider frame fails', async () => {
    vi.useFakeTimers()
    const { container } = renderCard()
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(container.querySelector('iframe')).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(12_001)
    })
    expect(screen.getByRole('status')).toHaveTextContent(/player did not load/i)
    expect(screen.getByRole('link', { name: /Original post/ })).toHaveAttribute('href', item.canonicalUrl)
    vi.useRealTimers()
  })

  it('mounts one player total when the item moves into the persistent Watch Dock', async () => {
    const { container } = renderCard()
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    const frame = await waitFor(() => container.querySelector('iframe') as HTMLIFrameElement)
    fireEvent.load(frame)
    fireEvent.click(screen.getByRole('button', { name: /Watch Dock/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('does not duplicate a restored dock item on a destination route card', () => {
    const firstRoute = renderCard()
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    fireEvent.click(screen.getByRole('button', { name: /Watch Dock/ }))
    firstRoute.unmount()

    const destinationRoute = renderCard()
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(destinationRoute.getByText('Playing in the Watch Dock')).toBeInTheDocument()
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  it('requires a tap when the browser requests reduced data', () => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } })
    const { container } = renderCard()
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(container.querySelector('iframe')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Data saver · load X/i }))
    expect(container.querySelector('iframe')).not.toBeNull()
  })
})
