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
  calls: [] as Array<{ name: string; args: unknown[] }>,
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

const { createComposer, resolveStageMedia } = await import('./composeCard')

/** A 2D context that accepts every call, remembers each one, and remembers compositing changes. */
function recordingContext(): CanvasRenderingContext2D {
  const state: Record<string | symbol, unknown> = {}
  return new Proxy(state, {
    get(target, prop) {
      if (prop in target) return target[prop]
      const name = String(prop)
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: () => undefined })
      if (prop === 'measureText') return (text: string) => ({ width: text.length * 6 })
      return (...args: unknown[]) => {
        h.calls.push({ name, args })
      }
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
  h.calls.length = 0
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

  it('crops the window to the focus point the page frames the clip on', () => {
    const entry = pitchBySlug('four-seam')
    if (!entry) throw new Error('four-seam is filed')
    const source = document.createElement('canvas')
    const dyFor = (focusY: number) => {
      h.calls.length = 0
      const composer = createComposer({ entry, face: 'front', material: PRESETS['ember-chrome'], width: 600, media: { kind: 'video', source, width: 900, height: 1600, focusY } })
      composer.draw(recordingContext(), { rx: 0, ry: 0 }, { x: 0.5, y: 0.5, height: 1.1, strength: 1 })
      const call = h.calls.find((c) => c.name === 'drawImage' && c.args[0] === source)
      if (!call) throw new Error('the clip was not drawn')
      return call.args[2] as number
    }
    // a higher focus point shows more of the top of the frame
    expect(dyFor(0.2)).toBeGreaterThan(dyFor(0.8))
  })

  it('reads the framing off the element the visitor is looking at', async () => {
    const stage = document.createElement('div')
    const video = document.createElement('video')
    video.style.objectPosition = '50% 34%'
    for (const [k, v] of [['readyState', 4], ['videoWidth', 900], ['videoHeight', 1600]] as const) Object.defineProperty(video, k, { value: v })
    stage.append(video)
    await expect(resolveStageMedia(stage, { waitMs: 50 })).resolves.toMatchObject({ kind: 'video', width: 900, height: 1600, focusY: 0.34 })
  })

  it('paints the movement wheel on the back, above the rows, as the page back carries it', () => {
    compose('back')
    const arcs = h.calls.filter((c) => c.name === 'arc').map((c) => c.args as number[])
    // the target: three rings around one centre, in the page wheel's proportions
    const centre = arcs.find(([x, y]) => arcs.filter(([x2, y2]) => x2 === x && y2 === y).length >= 3)
    expect(centre).toBeDefined()
    const [cx, cy] = centre!
    const radii = arcs.filter(([x, y]) => x === cx && y === cy).map(([, , r]) => r).sort((a, b) => b - a)
    expect(radii[1] / radii[0]).toBeCloseTo(0.62, 5)
    expect(radii[2] / radii[0]).toBeCloseTo(0.28, 5)
    // the spin axis is the dashed line
    expect(h.calls.some((c) => c.name === 'setLineDash' && (c.args[0] as number[]).length > 0)).toBe(true)
    // its caption, and the first row starting below the wheel
    const texts = h.calls.filter((c) => c.name === 'fillText').map((c) => ({ text: String(c.args[0]).replace(/\s+/g, ''), y: c.args[2] as number }))
    expect(texts.some((t) => t.text === 'RIDES')).toBe(true)
    const gripRow = texts.find((t) => t.text === 'GRIPCUE')
    expect(gripRow).toBeDefined()
    expect(gripRow!.y).toBeGreaterThan(cy + radii[0])
  })
})
