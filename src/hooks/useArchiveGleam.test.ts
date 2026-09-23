import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useArchiveGleam } from './useArchiveGleam'

/*
  The light passes are CSS; this hook only flips two classes. A pass must replay
  when its element re-enters view, and every pass must pause while the tab is hidden.
*/
describe('useArchiveGleam', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('marks targets in view, pauses in hidden tabs, and cleans up', () => {
    let fire: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {}
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb: typeof fire) { fire = cb }
      observe() {}
      disconnect() {}
    })
    const lockup = document.createElement('span')
    lockup.className = 'brand-lockup'
    document.body.appendChild(lockup)

    const { unmount } = renderHook(() => useArchiveGleam())
    fire([{ target: lockup, isIntersecting: true }])
    expect(lockup).toHaveClass('gleam-in-view')
    fire([{ target: lockup, isIntersecting: false }])
    expect(lockup).not.toHaveClass('gleam-in-view')

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(document.documentElement).toHaveClass('gleam-paused')
    hidden.mockRestore()

    unmount()
    expect(document.documentElement).not.toHaveClass('gleam-paused')
    lockup.remove()
  })
})
