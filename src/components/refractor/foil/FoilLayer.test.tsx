import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import type { TiltStore } from '../../../hooks/useCardTilt'

/*
  FoilLayer's contract under WebGL context loss. The browser caps live GL
  contexts (~16); when ours is evicted, the layer hands the glare back to the CSS
  card, waits ~150ms for a neighbor to free a slot, then remounts ONE fresh
  canvas. One second chance, ever — never a loop, and if the retry dies too the
  CSS card simply stands. jsdom has no WebGL, so the real createFoilProgram
  throws and the listener never attaches; we mock the program to a working stub
  so the recovery path itself is the thing under test, exactly as it runs live.
*/

// Hoisted so the vi.mock factory can close over the same spy we assert on.
const { createFoilProgram } = vi.hoisted(() => ({ createFoilProgram: vi.fn() }))

vi.mock('./foilProgram', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./foilProgram')>()
  return { ...actual, createFoilProgram }
})

// Imported after the mock is registered so FoilLayer binds the stubbed program.
const { default: FoilLayer } = await import('./FoilLayer')

function stubProgram() {
  return { render: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
}

// A resting tilt store: one snapshot, no subscribers firing.
const tiltStore: TiltStore = {
  get: () => ({ rx: 0, ry: 0, mx: 50, my: 32 }),
  subscribe: () => () => {},
}

const accent = { c1: '#0B0B0B', c2: '#37D6FF', c3: '#FF2D44' }

function lose(canvas: HTMLCanvasElement) {
  act(() => {
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  createFoilProgram.mockReset()
  createFoilProgram.mockImplementation(() => stubProgram())
  // FoilLayer builds a ResizeObserver OUTSIDE its GL try/catch; jsdom lacks it.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  // Route rAF through a fake-timer-controllable macrotask so the rest-pose frame
  // is deterministic under vi.advanceTimersByTime.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(0), 0) as unknown as number,
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('FoilLayer WebGL context-loss recovery', () => {
  it('mounts one live program on first paint', () => {
    render(<FoilLayer store={tiltStore} accent={accent} gold={false} />)
    expect(createFoilProgram).toHaveBeenCalledTimes(1)
  })

  it('takes exactly one second chance when the context is lost', () => {
    const { container } = render(<FoilLayer store={tiltStore} accent={accent} gold={false} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()

    lose(canvas as HTMLCanvasElement)
    // the retry is debounced ~150ms; nothing remounts before it elapses
    expect(createFoilProgram).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(160)
    })
    // epoch bumped -> a fresh canvas keyed remount -> exactly one new program
    expect(createFoilProgram).toHaveBeenCalledTimes(2)
  })

  it('never retries a second time (no loop) once the budget is spent', () => {
    const { container } = render(<FoilLayer store={tiltStore} accent={accent} gold={false} />)
    lose(container.querySelector('canvas') as HTMLCanvasElement)
    act(() => {
      vi.advanceTimersByTime(160)
    })
    expect(createFoilProgram).toHaveBeenCalledTimes(2)

    // the remounted canvas loses its context too — but the one-retry budget is gone
    lose(container.querySelector('canvas') as HTMLCanvasElement)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(createFoilProgram).toHaveBeenCalledTimes(2)
  })
})
