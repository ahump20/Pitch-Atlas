import { createComposer, loadCardFonts, resolveStageMedia } from './composeCard'
import { exportEligibility } from './eligibility'
import { CARD_ASPECT } from './cardLayout'
import { captionFor } from './exportPng'
import { poseCard, poseDimensions } from './poseCard'
import type { ExportLight, ExportPose, ExportProgress, ExportRequest, WebmResult, WebmSupport, WebmVerdict } from './types'

/*
  The WebM: seven seconds, thirty frames a second, a closed loop of the 1200-pixel
  card face posed into a 1440x2010 frame. The pose and the light each run one closed
  cycle around the request's own values, so the last frame hands off to the first
  without a jump.

  Every frame is composed and posed offscreen, then handed to the browser's own video
  encoder (WebCodecs, written into WebM by mediabunny) stamped with its place on the
  timeline: frame i at i/30 s. The next frame is drawn only once the encoder can take
  it, so the file holds all 210 frames and runs exactly seven seconds however long
  the machine needs (about forty seconds in Chrome on an M3 laptop; VP9 in software is
  the slow part, and its realtime mode was no faster on a card's detail). A live
  recorder (MediaRecorder) keeps only the frames its encoder has time for; at this
  size that was 57 of 211 on the same laptop, a choppy clip over a second short that
  did not close its loop. It stays as the fallback for a browser with no WebM encoder
  of its own. Where neither exists the support check says so before the click, in words.

  mediabunny is the heaviest thing here, so it is its own chunk, fetched on the first
  WebM rather than with the inspector.
*/

export const WEBM_WIDTH = 1200
export const WEBM_FPS = 30
export const WEBM_SECONDS = 7
export const WEBM_FRAMES = WEBM_FPS * WEBM_SECONDS
export const WEBM_BITRATE = 9_000_000

const TWO_PI = Math.PI * 2

/** The posed frame the WebM is written at: the card face plus the pose's margin and caption, evened for every encoder. */
export function webmFrameSize(faceWidth = WEBM_WIDTH, faceHeight = Math.round(WEBM_WIDTH * CARD_ASPECT)): { width: number; height: number } {
  const dims = poseDimensions(faceWidth, faceHeight)
  return { width: dims.width + (dims.width % 2), height: dims.height + (dims.height % 2) }
}

/*
  What the support check asks the browser before the visitor clicks, without
  downloading the encoder library: VP9 the way that library names it for this frame
  (profile 0, level 5 for 1440x2010 at 9 Mbps, 8-bit), then VP8. A parity test runs
  the library itself, so a new frame size that needs a new level fails there first.
*/
export const WEBM_PROBE_CODECS = ['vp09.00.50.08', 'vp8'] as const
const PROBE_CODEC_NAMES: Record<(typeof WEBM_PROBE_CODECS)[number], 'vp9' | 'vp8'> = { 'vp09.00.50.08': 'vp9', vp8: 'vp8' }

/** The pose at `phase` 0..1 of the loop; `loopPose(b, 0)` equals `loopPose(b, 1)`. */
export function loopPose(base: ExportPose, phase: number): ExportPose {
  return {
    rx: base.rx + 4.5 * Math.sin(TWO_PI * phase),
    ry: base.ry + 3 * Math.sin(2 * TWO_PI * phase + 1.1) - 3 * Math.sin(1.1),
  }
}

/** The light at `phase` 0..1; closed the same way. */
export function loopLight(base: ExportLight, phase: number): ExportLight {
  return {
    ...base,
    x: base.x + 0.12 * (Math.cos(TWO_PI * phase) - 1),
    y: base.y + 0.08 * Math.sin(TWO_PI * phase),
  }
}

const UNSUPPORTED = 'This browser cannot record a WebM of the card. The PNG export still works.'

/** The live recorder's WebM type, when this browser has one. */
function recorderMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement === 'undefined') return null
  if (typeof HTMLCanvasElement.prototype.captureStream !== 'function') return null
  for (const mimeType of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']) {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType
  }
  return null
}

/** The quick answer, before the probe: is there an encoder or a recorder at all. */
export function webmSupport(): WebmSupport {
  if (typeof VideoEncoder === 'function' || recorderMimeType()) return { ok: true }
  return { ok: false, reason: UNSUPPORTED }
}

/**
 * The real answer, and how: an encoder only counts if it writes a WebM codec at the
 * export's frame size, rate and bitrate; otherwise the recorder's WebM types decide.
 * The export takes this verdict as it stands rather than asking the browser again.
 */
export async function probeWebmSupport(): Promise<WebmSupport> {
  if (typeof VideoEncoder === 'function' && typeof VideoEncoder.isConfigSupported === 'function') {
    const { width, height } = webmFrameSize()
    for (const codec of WEBM_PROBE_CODECS) {
      const supported = await VideoEncoder.isConfigSupported({ codec, width, height, framerate: WEBM_FPS, bitrate: WEBM_BITRATE }).then(
        (answer) => Boolean(answer.supported),
        () => false,
      )
      if (supported) return { ok: true, via: { path: 'encoder', codec: PROBE_CODEC_NAMES[codec] } }
    }
  }
  const mimeType = recorderMimeType()
  return mimeType ? { ok: true, via: { path: 'recorder', mimeType } } : { ok: false, reason: UNSUPPORTED }
}

type Mediabunny = typeof import('./webmEncoder')

async function loadEncoder(): Promise<Mediabunny> {
  try {
    return await import('./webmEncoder')
  } catch {
    throw new Error('The video encoder did not download. Check the connection, then export again.')
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))
const cancelled = () => new DOMException('Export cancelled.', 'AbortError')

type Progress = ((p: ExportProgress) => void) | undefined

/** Each frame drawn, then stamped and encoded; the encoder's pace is the loop's pace. */
async function encodeFrames(
  mb: Mediabunny,
  out: HTMLCanvasElement,
  paint: (i: number) => void,
  codec: 'vp9' | 'vp8',
  alpha: boolean,
  onProgress: Progress,
  signal: AbortSignal | undefined,
): Promise<Blob> {
  const target = new mb.BufferTarget()
  const output = new mb.Output({ format: new mb.WebMOutputFormat(), target })
  const source = new mb.CanvasSource(out, { codec, quality: new mb.Quality({ bitrate: WEBM_BITRATE }), alpha: alpha ? 'keep' : 'discard' })
  output.addVideoTrack(source, { frameRate: WEBM_FPS })
  try {
    await output.start()
    for (let i = 0; i < WEBM_FRAMES; i++) {
      if (signal?.aborted) throw cancelled()
      paint(i)
      // resolves once the encoder can take the next frame, so none is ever dropped
      await source.add(i / WEBM_FPS, 1 / WEBM_FPS)
      onProgress?.({ phase: 'rendering', fraction: ((i + 1) / WEBM_FRAMES) * 0.92 })
      // a breath for the page between frames: the progress bar moves, the tab answers
      await sleep(0)
    }
    if (signal?.aborted) throw cancelled()
    onProgress?.({ phase: 'encoding', fraction: 0.96 })
    await output.finalize()
  } catch (error) {
    if (output.state === 'pending' || output.state === 'started') await output.cancel().catch(() => undefined)
    throw error
  }
  if (!target.buffer) throw new Error('The encoder finished without writing a file.')
  return new Blob([target.buffer], { type: 'video/webm' })
}

/** The fallback: frames pushed to a live recorder at the loop's own pace. */
async function recordLive(
  out: HTMLCanvasElement,
  paint: (i: number) => void,
  mimeType: string,
  onProgress: Progress,
  signal: AbortSignal | undefined,
): Promise<Blob> {
  // The capture track and the recorder are released whatever throws: a recorder that
  // refuses its type at construction must not leave a track behind for every retry.
  let track: CanvasCaptureMediaStreamTrack | undefined
  let recorder: MediaRecorder | undefined
  let stopped: Promise<void> | undefined
  try {
    const stream = out.captureStream(0)
    track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined
    if (!track) throw new Error('This browser could not capture the canvas for recording.')
    const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: WEBM_BITRATE })
    recorder = rec
    const chunks: Blob[] = []
    rec.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    stopped = new Promise<void>((resolve) => {
      rec.onstop = () => resolve()
    })

    // the first frame is drawn before the recorder starts so time zero is the card
    paint(0)
    rec.start()
    track.requestFrame()
    const frameMs = 1000 / WEBM_FPS
    const t0 = performance.now()
    for (let i = 1; i <= WEBM_FRAMES; i++) {
      if (signal?.aborted) throw cancelled()
      const wait = t0 + i * frameMs - performance.now()
      if (wait > 0) await sleep(wait)
      // frame WEBM_FRAMES is the same picture as frame 0: it closes the loop on the timeline
      paint(i)
      track.requestFrame()
      onProgress?.({ phase: 'rendering', fraction: (i / WEBM_FRAMES) * 0.92 })
    }
    await sleep(frameMs * 2)
    onProgress?.({ phase: 'encoding', fraction: 0.96 })
    rec.stop()
    await stopped
    return new Blob(chunks, { type: mimeType.split(';')[0] })
  } catch (error) {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      await stopped
    }
    throw error
  } finally {
    track?.stop()
  }
}

export async function exportSpecimenWebm(
  req: ExportRequest,
  onProgress?: (p: ExportProgress) => void,
  signal?: AbortSignal,
): Promise<WebmResult> {
  // the support check asked the browser before the click; it is asked here only when
  // the request came without its answer
  let via: WebmVerdict | undefined = req.via
  if (!via) {
    const support = await probeWebmSupport()
    if (!support.ok) throw new Error(support.reason)
    via = support.via
  }
  if (!via) throw new Error(UNSUPPORTED)
  const eligibility = exportEligibility(req.entry, req.face)
  if (!eligibility.exportable) throw new Error(eligibility.reason ?? 'This face cannot be exported.')

  onProgress?.({ phase: 'preparing', fraction: 0 })
  await loadCardFonts()
  const media = req.face === 'front' ? await resolveStageMedia(req.stage) : null
  let mb: Mediabunny | null = null
  if (via.path === 'encoder') {
    try {
      mb = await loadEncoder()
    } catch (error) {
      // the live recorder can still make the loop; with no recorder either, the
      // failed download is the reason to give, and no GL context is taken for it
      const mimeType = recorderMimeType()
      if (!mimeType) throw error
      via = { path: 'recorder', mimeType }
    }
  }
  if (signal?.aborted) throw cancelled()
  const composer = createComposer({
    entry: req.entry,
    face: req.face,
    material: req.face === 'front' ? req.material : req.backMaterial,
    width: WEBM_WIDTH,
    media,
  })

  // From here on the export holds a GL context; one finally gives it back.
  try {
    const face = document.createElement('canvas')
    face.width = composer.layout.width
    face.height = composer.layout.height
    const faceCtx = face.getContext('2d')
    const frame = webmFrameSize(face.width, face.height)
    const out = document.createElement('canvas')
    out.width = frame.width
    out.height = frame.height
    const outCtx = out.getContext('2d')
    if (!faceCtx || !outCtx) throw new Error('A drawing surface could not be created.')

    const caption = captionFor(req.entry, req.face)
    const gold = req.entry.display.specimenNo === '00' && req.face === 'front'
    const paint = (i: number) => {
      const phase = (i % WEBM_FRAMES) / WEBM_FRAMES
      const pose = loopPose(req.pose, phase)
      composer.draw(faceCtx, pose, loopLight(req.light, phase))
      poseCard(outCtx, face, { pose, backdrop: req.backdrop, caption, gold })
    }

    let result: WebmResult
    if (via.path === 'encoder' && mb) result = { blob: await encodeFrames(mb, out, paint, via.codec, req.backdrop === 'transparent', onProgress, signal), path: 'encoder', via }
    else if (via.path === 'recorder') result = { blob: await recordLive(out, paint, via.mimeType, onProgress, signal), path: 'recorder', via }
    else throw new Error(UNSUPPORTED)
    onProgress?.({ phase: 'done', fraction: 1 })
    return result
  } finally {
    composer.dispose()
  }
}
