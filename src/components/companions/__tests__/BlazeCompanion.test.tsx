import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BlazeCompanion } from '../BlazeCompanion'
import {
  BLAZE_STORAGE_KEY,
  clampScrollProgress,
  dispatchBlazeEvent,
  initialBlazePreference,
  moodForPath,
} from '../blazeMotion'

function installMatchMedia(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function renderCompanion(path = '/') {
  const router = createMemoryRouter([{ path: '*', element: <BlazeCompanion /> }], {
    initialEntries: [path],
  })
  return {
    router,
    ...render(<RouterProvider router={router} />),
  }
}

beforeEach(() => {
  installMatchMedia(false)
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe('BlazeCompanion', () => {
  it('renders with a bounded pat control and decorative art layers', () => {
    renderCompanion('/')

    const companion = screen.getByTestId('blaze-companion')
    expect(companion).toHaveAttribute('data-mood', 'sniffing')
    expect(companion).toHaveAttribute('data-persona', 'home-plate')
    expect(companion.querySelector('[data-source="derived-strip"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /give blaze a quick pat/i })).toBeInTheDocument()
    expect(companion.querySelector('.blaze-helmet')).toBeInTheDocument()
  })

  it('hides when the localStorage setting is off', () => {
    window.localStorage.setItem(BLAZE_STORAGE_KEY, 'false')
    renderCompanion('/')

    expect(screen.queryByTestId('blaze-companion')).not.toBeInTheDocument()
  })

  it('reduces chase motion to a static state', () => {
    installMatchMedia(true)
    renderCompanion('/pitch/four-seam')

    const companion = screen.getByTestId('blaze-companion')
    expect(companion).toHaveAttribute('data-reduced-motion', 'true')
    expect(companion).toHaveAttribute('data-mood', 'still')
  })

  it('updates route context when the route changes', async () => {
    const { router } = renderCompanion('/')
    expect(screen.getByTestId('blaze-companion')).toHaveAttribute('data-mood', 'sniffing')

    await act(async () => {
      await router.navigate('/pitch/four-seam')
    })

    expect(screen.getByTestId('blaze-companion')).toHaveAttribute('data-mood', 'chasing')
  })

  it.each(['/sources', '/sources/', '/privacy', '/account/delete-account', '/report/grip', '/block/user', '/repertoire', '/grips'])(
    'hides on serious, source-label, or dense index route %s',
    (path) => {
      renderCompanion(path)

      expect(screen.queryByTestId('blaze-companion')).not.toBeInTheDocument()
    },
  )

  it('clears event mood timers on unmount', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = renderCompanion('/')

    act(() => {
      dispatchBlazeEvent({ mood: 'caught', ttlMs: 2400 })
    })

    unmount()

    expect(clearSpy).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('plays a visible bark reaction when Blaze is patted', () => {
    vi.useFakeTimers()
    renderCompanion('/')

    fireEvent.click(screen.getByRole('button', { name: /give blaze a quick pat/i }))

    const companion = screen.getByTestId('blaze-companion')
    expect(companion).toHaveAttribute('data-reaction', 'bark')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(companion).toHaveAttribute('data-reaction', 'none')
    vi.useRealTimers()
  })

  it('maps success events to the belly reaction', () => {
    vi.useFakeTimers()
    renderCompanion('/pitch/four-seam')

    act(() => {
      dispatchBlazeEvent({ mood: 'caught', ttlMs: 1500 })
    })

    const companion = screen.getByTestId('blaze-companion')
    expect(companion).toHaveAttribute('data-mood', 'caught')
    expect(companion).toHaveAttribute('data-reaction', 'belly')

    act(() => {
      vi.advanceTimersByTime(1600)
    })

    expect(companion).toHaveAttribute('data-reaction', 'none')
    vi.useRealTimers()
  })

  it('keeps helpers safe without browser storage', () => {
    expect(initialBlazePreference(undefined)).toBe(true)
    expect(clampScrollProgress(-1)).toBe(0)
    expect(clampScrollProgress(2)).toBe(1)
    expect(moodForPath('/repertoire/knuckle-slurve')).toBe('chasing')
    expect(moodForPath('/sources')).toBe('hidden')
    expect(moodForPath('/sources/')).toBe('hidden')
  })

  it('cleans up scroll listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderCompanion('/pitch/four-seam')

    unmount()

    expect(addSpy.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
    expect(removeSpy.mock.calls.some(([name]) => name === 'scroll')).toBe(true)
  })
})
