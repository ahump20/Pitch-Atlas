import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import type { TiltStore } from '../../../hooks/useCardTilt'
import { PRESETS } from './materialPresets'

/*
  MaterialLayer's contract under WebGL context loss. The browser caps live GL
  contexts (~16); when ours is evicted, the layer hands the material back to the CSS
  card, waits ~150ms for a neighbour to free a slot, then remounts ONE fresh canvas.
  One second chance, ever — never a loop, and if the retry dies too the CSS card
  simply stands. jsdom has no WebGL, so the real program throws and the listener never
  attaches; we mock the program to a working stub so the recovery path itself is the
  thing under test, exactly as it runs live.
*/

const { createCardMaterialProgram } = vi.hoisted(() => ({ createCardMaterialProgram: vi.fn() }))

vi.mock('./cardMaterialProgram', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./cardMaterialProgram')>()
  return { ...actual, createCardMaterialProgram }
})

const { default: MaterialLayer } = await import('./MaterialLayer')
const { measureLayout } = await import('./measureLayout')

function stubProgram() {
  return { render: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
}

const tiltStore: TiltStore = {
  get: () => ({ rx: 0, ry: 0, mx: 50, my: 32, lightHeight: 0.8, lightStrength: 1, source: 'rest' }),
  subscribe: () => () => {},
  nudge: () => {},
}

const identity = { c2: [0.2, 0.4, 0.5] as [number, number, number], c3: [0.7, 0.8, 0.9] as [number, number, number], ring: [0.5, 0.5, 0.5] as [number, number, number], seed: 0 }

function lose(canvas: HTMLCanvasElement) {
  act(() => {
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  })
}

function mount() {
  return render(
    <div className="rfx-card">
      <MaterialLayer store={tiltStore} material={PRESETS['base-chrome']} identity={identity} />
      <div className="rfx-field">
        <div className="rfx-inner">
          <header className="rfx-head" />
          <div className="rfx-stage" />
          <div className="rfx-strip" />
        </div>
      </div>
    </div>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  createCardMaterialProgram.mockReset()
  createCardMaterialProgram.mockImplementation(() => stubProgram())
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
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

describe('MaterialLayer', () => {
  it('mounts one live program on first paint and draws the rest frame', () => {
    const prog = stubProgram()
    createCardMaterialProgram.mockImplementation(() => prog)
    const { container } = mount()
    expect(createCardMaterialProgram).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(5)
    })
    expect(prog.render).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.rfx-card')).toHaveClass('is-foil-live')
  })

  it('takes exactly one second chance when the context is lost', () => {
    const { container } = mount()
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    lose(canvas as HTMLCanvasElement)
    expect(createCardMaterialProgram).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(160)
    })
    expect(createCardMaterialProgram).toHaveBeenCalledTimes(2)
  })

  it('never retries a second time once the budget is spent', () => {
    const { container } = mount()
    lose(container.querySelector('canvas') as HTMLCanvasElement)
    act(() => {
      vi.advanceTimersByTime(160)
    })
    expect(createCardMaterialProgram).toHaveBeenCalledTimes(2)
    lose(container.querySelector('canvas') as HTMLCanvasElement)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(createCardMaterialProgram).toHaveBeenCalledTimes(2)
  })

  it('measures the print rects along the offset chain of the card', () => {
    const { container } = mount()
    const card = container.querySelector('.rfx-card') as HTMLElement
    const layout = measureLayout(card)
    // jsdom has no layout, so every box is zero, but the shape is complete
    expect(layout).toMatchObject({ pad: 0, window: { x: 0, y: 0, w: 0, h: 0 } })
    expect(layout.windowRadius).toHaveLength(2)
  })
})
