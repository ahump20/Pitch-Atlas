import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pitchBySlug } from '../../../data/pitches'
import { PRESETS } from '../../refractor/material/materialPresets'
import type { ExportRequest } from './types'

/*
  When the encoder's chunk does not download (a dropped connection, a stale deploy),
  the export must still reach the live recorder where the browser has one, and say
  what went wrong only where it has neither. The encoder module fails to load in this
  file; the recorder, the canvas stream and the clock are stood in.
*/

const h = vi.hoisted(() => ({
  recorderStarted: false,
  recorderTypes: ['video/webm;codecs=vp9'] as string[],
  dispose: vi.fn(),
  draw: vi.fn(),
}))

vi.mock('./webmEncoder', () => {
  throw new Error('Failed to fetch dynamically imported module')
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

const { exportSpecimenWebm, WEBM_FRAMES } = await import('./exportWebm')

class FakeRecorder {
  static isTypeSupported(type: string) {
    return h.recorderTypes.includes(type)
  }
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  constructor(_stream: unknown, _options: unknown) {}
  start() {
    this.state = 'recording'
    h.recorderStarted = true
  }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob([new Uint8Array(8)], { type: 'video/webm' }) })
    this.onstop?.()
  }
}

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
  }
}

beforeEach(() => {
  h.recorderStarted = false
  h.recorderTypes = ['video/webm;codecs=vp9']
  h.dispose.mockClear()
  h.draw.mockClear()
  vi.stubGlobal('VideoEncoder', function VideoEncoder() {})
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as unknown as RenderingContext)
  Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', {
    configurable: true,
    writable: true,
    value: () => ({ getVideoTracks: () => [{ requestFrame: () => undefined, stop: () => undefined }] }),
  })
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete (HTMLCanvasElement.prototype as { captureStream?: unknown }).captureStream
})

describe('exportSpecimenWebm when the encoder does not download', () => {
  it('records through the live recorder instead of giving up', async () => {
    vi.stubGlobal('MediaRecorder', FakeRecorder)
    const done = exportSpecimenWebm(request())
    await vi.runAllTimersAsync()
    const { blob, path } = await done
    expect(h.recorderStarted).toBe(true)
    expect(blob.type).toBe('video/webm')
    expect(path).toBe('recorder')
    // frame 0, then frames 1..210 (the last closes the loop on the timeline)
    expect(h.draw).toHaveBeenCalledTimes(WEBM_FRAMES + 1)
    expect(h.dispose).toHaveBeenCalledTimes(1)
  })

  it('says the encoder did not download when there is no recorder either, before taking a GL context', async () => {
    const done = exportSpecimenWebm(request())
    const outcome = expect(done).rejects.toThrow(/did not download/)
    await vi.runAllTimersAsync()
    await outcome
    expect(h.draw).not.toHaveBeenCalled()
    expect(h.dispose).not.toHaveBeenCalled()
  })
})
