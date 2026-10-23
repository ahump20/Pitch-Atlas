import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pitchBySlug } from '../../../data/pitches'
import { PRESETS } from '../../refractor/material/materialPresets'
import type { MaterialLayout } from '../../refractor/material/cardMaterialProgram'

/*
  The composer lays the material over the print the way the page does. The front's
  stock opens a window for the media; the back has no media, so its stock must cover
  the whole field (an open window there showed as a dark arch behind the rows). Both
  paths are pinned: the WebGL material and the flat stock painted where WebGL is
  missing. jsdom has neither a 2D context nor WebGL, so both are stood in here.
*/

const h = vi.hoisted(() => ({
  webgl: true,
  rendered: [] as MaterialLayout[],
  coverages: [] as string[],
  ops: [] as string[],
}))

vi.mock('../../refractor/material/cardMaterialProgram', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../refractor/material/cardMaterialProgram')>()),
  createCardMaterialProgram: () => {
    if (!h.webgl) throw new Error('no WebGL2 here')
    return {
      resize: () => undefined,
      render: ({ layout, material }: { layout: MaterialLayout; material: { coverage: string } }) => {
        h.rendered.push(layout)
        h.coverages.push(material.coverage)
      },
      dispose: () => undefined,
    }
  },
}))

const { createComposer } = await import('./composeCard')

/** A 2D context that accepts every call and remembers compositing changes. */
function recordingContext(): CanvasRenderingContext2D {
  const state: Record<string | symbol, unknown> = {}
  return new Proxy(state, {
    get(target, prop) {
      if (prop in target) return target[prop]
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: () => undefined })
      if (prop === 'measureText') return (text: string) => ({ width: text.length * 6 })
      return () => undefined
    },
    set(target, prop, value) {
      if (prop === 'globalCompositeOperation') h.ops.push(String(value))
      target[prop] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

function compose(face: 'front' | 'back', coverage?: 'full' | 'window' | 'frame') {
  const entry = pitchBySlug('four-seam')
  if (!entry) throw new Error('four-seam is filed')
  const preset = face === 'front' ? PRESETS['ember-chrome'] : PRESETS['quiet-ink-bone']
  const material = coverage ? { ...preset, coverage } : preset
  const composer = createComposer({ entry, face, material, width: 600, media: null })
  composer.draw(recordingContext(), { rx: 2, ry: -1 }, { x: 0.6, y: 0.4, height: 1.1, strength: 1 })
  return composer
}

beforeEach(() => {
  h.webgl = true
  h.rendered.length = 0
  h.coverages.length = 0
  h.ops.length = 0
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => recordingContext() as unknown as RenderingContext)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createComposer', () => {
  it("opens the front's stock for the media window", () => {
    const composer = compose('front')
    const window = h.rendered[0].window
    expect(window.w).toBeGreaterThan(0)
    expect(window).toEqual(composer.layout.window)
  })

  it("covers the whole back with stock: no window, header or strip", () => {
    compose('back')
    const { window, head, strip } = h.rendered[0]
    for (const rect of [window, head, strip]) expect(rect.w * rect.h).toBe(0)
  })

  it("keeps the coverage the visitor tuned for the back, as the page does", () => {
    compose('back', 'window')
    expect(h.coverages[0]).toBe('window')
  })

  it('cuts no window into the flat stock of a back without WebGL', () => {
    h.webgl = false
    compose('back')
    expect(h.ops).not.toContain('destination-out')
  })

  it('still cuts the window into the flat stock of a front without WebGL', () => {
    h.webgl = false
    compose('front')
    expect(h.ops).toContain('destination-out')
  })
})
