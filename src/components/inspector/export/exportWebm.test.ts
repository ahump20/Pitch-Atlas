import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pitchBySlug } from '../../../data/pitches'
import { PRESETS } from '../../refractor/material/materialPresets'
import type { ExportRequest } from './types'

/*
  The WebM contract: the browser's encoder gets every frame of the loop, each stamped
  with its own place on the timeline (frame i at i/30 s, one thirtieth long), and the
  next frame waits for the encoder. A cancel stops the output and gives the GL context
  back. The live recorder is only the fallback for a browser whose encoder cannot
  write WebM. jsdom has neither encoder nor recorder, so both are stood in here; the
  composer and the posing are stubs, because the pixels are pinned elsewhere.
*/

const h = vi.hoisted(() => ({
  added: [] as Array<[number, number]>,
  sourceConfig: null as unknown,
  outputs: [] as Array<{ state: string; cancel: () => Promise<void> }>,
  canEncode: true as boolean | ((codec: string) => boolean),
  canEncodeCalls: [] as string[],
  dispose: vi.fn(),
  draw: vi.fn(),
}))

vi.mock('mediabunny', () => {
  class Quality {
    constructor(public options: unknown) {}
  }
  class BufferTarget {
    buffer: ArrayBuffer | null = null
  }
  class WebMOutputFormat {}
  class CanvasSource {
    constructor(_canvas: unknown, config: unknown) {
      h.sourceConfig = config
    }
    async add(timestamp: number, duration: number) {
      h.added.push([timestamp, duration])
    }
  }
  class Output {
    state = 'pending'
    target: BufferTarget
    constructor(options: { target: BufferTarget }) {
      this.target = options.target
      h.outputs.push(this)
    }
    addVideoTrack() {}
    async start() {
      this.state = 'started'
    }
    async finalize() {
      this.state = 'finalized'
      this.target.buffer = new ArrayBuffer(16)
    }
    async cancel() {
      this.state = 'canceled'
    }
  }
  const canEncodeVideo = async (codec: string) => {
    h.canEncodeCalls.push(codec)
    return typeof h.canEncode === 'function' ? h.canEncode(codec) : h.canEncode
  }
  return { Quality, BufferTarget, WebMOutputFormat, CanvasSource, Output, canEncodeVideo }
})

vi.mock('./composeCard', () => ({
  loadCardFonts: async () => undefined,
  resolveStageMedia: async () => null,
  createComposer: () => ({ layout: { width: 1200, height: 1680 }, draw: h.draw, dispose: h.dispose }),
}))

vi.mock('./poseCard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./poseCard')>()),
  poseCard: () => undefined,
}))

const { exportSpecimenWebm, probeWebmSupport, webmFrameSize, webmSupport, WEBM_FPS, WEBM_FRAMES } = await import('./exportWebm')

function request(): ExportRequest {
  const entry = pitchBySlug('four-seam')
  if (!entry) throw new Error('four-seam is filed')
  return {
    entry,
    face: 'front',
    material: PRESETS['ember-chrome'],
    backMaterial: PRESETS['quiet-ink-bone'],
    pose: { rx: 3, ry: -2 },
    light: { x: 0.6, y: 0.4, height: 1.1, strength: 1 },
    backdrop: 'void',
    // what the support check found before the click: the browser's encoder, writing VP9
    via: { path: 'encoder', codec: 'vp9' },
  }
}

beforeEach(() => {
  h.added.length = 0
  h.outputs.length = 0
  h.sourceConfig = null
  h.canEncode = true
  h.canEncodeCalls = []
  h.dispose.mockClear()
  h.draw.mockClear()
  vi.stubGlobal('VideoEncoder', function VideoEncoder() {})
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as unknown as RenderingContext)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('exportSpecimenWebm with the browser encoder', () => {
  it('hands the encoder every frame, stamped, for exactly seven seconds', async () => {
    const { blob, path, via } = await exportSpecimenWebm(request())
    expect(path).toBe('encoder')
    // the result says how the loop was made, so the panel can word its next promise by it
    expect(via).toEqual({ path: 'encoder', codec: 'vp9' })
    expect(h.added).toHaveLength(WEBM_FRAMES)
    h.added.forEach(([timestamp, duration], i) => {
      expect(timestamp).toBeCloseTo(i / WEBM_FPS, 9)
      expect(duration).toBeCloseTo(1 / WEBM_FPS, 9)
    })
    const [lastTimestamp, lastDuration] = h.added[WEBM_FRAMES - 1]
    expect(lastTimestamp + lastDuration).toBeCloseTo(7, 9)
    expect(h.draw).toHaveBeenCalledTimes(WEBM_FRAMES)
    expect(blob.type).toBe('video/webm')
    expect(h.outputs[0].state).toBe('finalized')
    expect(h.dispose).toHaveBeenCalledTimes(1)
  })

  it("starts from the support check's verdict: a VP8 verdict writes VP8, confirmed once by the encoder library", async () => {
    // the library would pick VP9 if it were asked to choose from scratch
    h.canEncode = true
    const { path } = await exportSpecimenWebm({ ...request(), via: { path: 'encoder', codec: 'vp8' } })
    expect(path).toBe('encoder')
    expect(h.sourceConfig).toMatchObject({ codec: 'vp8' })
    expect(h.canEncodeCalls).toEqual(['vp8'])
  })

  it("falls back to the other codec where the library will not write the check's choice", async () => {
    // some browsers' support check over-reports; the library test-encodes before it agrees
    h.canEncode = (codec) => codec === 'vp8'
    const { path, via } = await exportSpecimenWebm(request())
    expect(path).toBe('encoder')
    expect(via).toEqual({ path: 'encoder', codec: 'vp8' })
    expect(h.sourceConfig).toMatchObject({ codec: 'vp8' })
    expect(h.canEncodeCalls).toEqual(['vp9', 'vp8'])
  })

  it('says so in words, before taking a GL context, where the library writes neither codec and there is no recorder', async () => {
    h.canEncode = false
    await expect(exportSpecimenWebm(request())).rejects.toThrow(/PNG export still works/)
    expect(h.added).toHaveLength(0)
    expect(h.draw).not.toHaveBeenCalled()
    expect(h.dispose).not.toHaveBeenCalled()
  })

  it('runs the support check itself when the request carries no verdict', async () => {
    const Encoder = Object.assign(function VideoEncoder() {}, {
      isConfigSupported: async (config: VideoEncoderConfig) => ({ supported: config.codec === 'vp8', config }),
    })
    vi.stubGlobal('VideoEncoder', Encoder)
    await exportSpecimenWebm({ ...request(), via: undefined })
    expect(h.sourceConfig).toMatchObject({ codec: 'vp8' })
    expect(h.canEncodeCalls).toEqual(['vp8'])
  })

  it('keeps the transparency when the backdrop is transparent', async () => {
    await exportSpecimenWebm({ ...request(), backdrop: 'transparent' })
    expect(h.sourceConfig).toMatchObject({ codec: 'vp9', alpha: 'keep' })
  })

  it('stops the output and gives the GL context back when cancelled', async () => {
    const controller = new AbortController()
    let frames = 0
    const done = exportSpecimenWebm(request(), (p) => {
      if (p.phase === 'rendering' && ++frames === 12) controller.abort()
    }, controller.signal)
    await expect(done).rejects.toMatchObject({ name: 'AbortError' })
    expect(h.added.length).toBeLessThan(WEBM_FRAMES)
    expect(h.outputs[0].state).toBe('canceled')
    expect(h.dispose).toHaveBeenCalledTimes(1)
  })
})

describe('the WebM support check', () => {
  it('counts the browser encoder as a way to make a WebM', () => {
    expect(webmSupport().ok).toBe(true)
  })

  /** A VideoEncoder stand-in whose answers this test chooses, and which remembers what it was asked. */
  function encoderAnswering(supported: (codec: string) => boolean) {
    const asked: VideoEncoderConfig[] = []
    const Encoder = function VideoEncoder() {} as unknown as { isConfigSupported: (c: VideoEncoderConfig) => Promise<VideoEncoderSupport> }
    Encoder.isConfigSupported = async (config) => {
      asked.push(config)
      return { supported: supported(config.codec), config }
    }
    vi.stubGlobal('VideoEncoder', Encoder)
    return asked
  }

  it('asks the encoder for a WebM codec at the frame size the export writes, and names it', async () => {
    const asked = encoderAnswering((codec) => codec.startsWith('vp09'))
    await expect(probeWebmSupport()).resolves.toEqual({ ok: true, via: { path: 'encoder', codec: 'vp9' } })
    expect(asked[0]).toMatchObject({ codec: 'vp09.00.50.08', ...webmFrameSize(), framerate: WEBM_FPS, bitrate: 9_000_000 })
    expect(webmFrameSize()).toEqual({ width: 1440, height: 2010 })
  })

  it('tries VP8 when VP9 is refused', async () => {
    const asked = encoderAnswering((codec) => codec === 'vp8')
    await expect(probeWebmSupport()).resolves.toEqual({ ok: true, via: { path: 'encoder', codec: 'vp8' } })
    expect(asked.map((c) => c.codec)).toEqual(['vp09.00.50.08', 'vp8'])
  })

  it('says so before the click when the encoder writes no WebM and there is no recorder', async () => {
    encoderAnswering(() => false)
    await expect(probeWebmSupport()).resolves.toEqual({
      ok: false,
      reason: expect.stringMatching(/cannot record a WebM[\s\S]*PNG export still works/),
    })
  })

  it('counts the live recorder when the encoder writes no WebM', async () => {
    encoderAnswering(() => false)
    vi.stubGlobal('MediaRecorder', { isTypeSupported: (type: string) => type === 'video/webm' })
    Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', { configurable: true, writable: true, value: () => null })
    try {
      await expect(probeWebmSupport()).resolves.toEqual({ ok: true, via: { path: 'recorder', mimeType: 'video/webm' } })
    } finally {
      delete (HTMLCanvasElement.prototype as { captureStream?: unknown }).captureStream
    }
  })

  it('says so in words when the encoder cannot write WebM and there is no recorder, before taking a GL context', async () => {
    // an encoder with no WebM codec and no recorder: the support check finds no way
    await expect(exportSpecimenWebm({ ...request(), via: undefined })).rejects.toThrow(/PNG export still works/)
    expect(h.added).toHaveLength(0)
    expect(h.dispose).not.toHaveBeenCalled()
  })
})
