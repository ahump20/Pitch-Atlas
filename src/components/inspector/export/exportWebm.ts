import { createComposer, loadCardFonts, resolveStageMedia } from './composeCard'
import { exportEligibility } from './eligibility'
import { captionFor } from './exportPng'
import { poseCard, poseDimensions } from './poseCard'
import type { ExportLight, ExportPose, ExportProgress, ExportRequest, WebmSupport } from './types'

/*
  The WebM: seven seconds, thirty frames a second, 1200 pixels wide, a closed loop.
  The pose and the light each run one closed cycle around the request's own values,
  so the last frame hands off to the first without a jump. Every frame is composed
  and posed offscreen, then pushed to a MediaRecorder through a zero-rate capture
  stream, so the recorder sees exactly the frames we draw, at the pace we draw them.
  Where a browser cannot record WebM the support check says so, in words.
*/

export const WEBM_WIDTH = 1200
export const WEBM_FPS = 30
export const WEBM_SECONDS = 7
export const WEBM_FRAMES = WEBM_FPS * WEBM_SECONDS

const TWO_PI = Math.PI * 2

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

const UNSUPPORTED = 'This browser cannot record a WebM from a canvas. Safari before 18.4 is the usual case. The PNG export still works.'

export function webmSupport(): WebmSupport {
  if (typeof MediaRecorder === 'undefined' || typeof HTMLCanvasElement === 'undefined') return { ok: false, reason: UNSUPPORTED }
  if (typeof HTMLCanvasElement.prototype.captureStream !== 'function') return { ok: false, reason: UNSUPPORTED }
  for (const mimeType of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']) {
    if (MediaRecorder.isTypeSupported(mimeType)) return { ok: true, mimeType }
  }
  return { ok: false, reason: UNSUPPORTED }
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

export async function exportSpecimenWebm(
  req: ExportRequest,
  onProgress?: (p: ExportProgress) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  const support = webmSupport()
  if (!support.ok) throw new Error(support.reason)
  const eligibility = exportEligibility(req.entry, req.face)
  if (!eligibility.exportable) throw new Error(eligibility.reason ?? 'This face cannot be exported.')

  onProgress?.({ phase: 'preparing', fraction: 0 })
  await loadCardFonts()
  const media = req.face === 'front' ? await resolveStageMedia(req.stage) : null
  if (signal?.aborted) throw new DOMException('Export cancelled.', 'AbortError')
  const composer = createComposer({
    entry: req.entry,
    face: req.face,
    material: req.face === 'front' ? req.material : req.backMaterial,
    width: WEBM_WIDTH,
    media,
  })

  // From here on the export holds a GL context and, once it exists, a capture track.
  // One finally releases both, whatever throws: a recorder that refuses its MIME type
  // at construction must not leave a context behind for every retry.
  let track: CanvasCaptureMediaStreamTrack | undefined
  let recorder: MediaRecorder | undefined
  let stopped: Promise<void> | undefined
  try {
    const face = document.createElement('canvas')
    face.width = composer.layout.width
    face.height = composer.layout.height
    const faceCtx = face.getContext('2d')
    const dims = poseDimensions(face.width, face.height)
    const out = document.createElement('canvas')
    // even dimensions keep every encoder happy
    out.width = dims.width + (dims.width % 2)
    out.height = dims.height + (dims.height % 2)
    const outCtx = out.getContext('2d')
    if (!faceCtx || !outCtx) throw new Error('A drawing surface could not be created.')

    const caption = captionFor(req.entry, req.face)
    const gold = req.entry.display.specimenNo === '00' && req.face === 'front'
    const stream = out.captureStream(0)
    track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined
    if (!track) throw new Error('This browser could not capture the canvas for recording.')
    const rec = new MediaRecorder(stream, { mimeType: support.mimeType, videoBitsPerSecond: 9_000_000 })
    recorder = rec
    const chunks: Blob[] = []
    rec.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    stopped = new Promise<void>((resolve) => {
      rec.onstop = () => resolve()
    })

    // the first frame is drawn before the recorder starts so time zero is the card
    composer.draw(faceCtx, loopPose(req.pose, 0), loopLight(req.light, 0))
    poseCard(outCtx, face, { pose: loopPose(req.pose, 0), backdrop: req.backdrop, caption, gold })
    rec.start()
    track.requestFrame()
    const frameMs = 1000 / WEBM_FPS
    const t0 = performance.now()
    for (let i = 1; i <= WEBM_FRAMES; i++) {
      if (signal?.aborted) throw new DOMException('Export cancelled.', 'AbortError')
      const due = t0 + i * frameMs
      const wait = due - performance.now()
      if (wait > 0) await sleep(wait)
      // frame WEBM_FRAMES is the same picture as frame 0: it closes the loop on the timeline
      const phase = (i % WEBM_FRAMES) / WEBM_FRAMES
      const pose = loopPose(req.pose, phase)
      composer.draw(faceCtx, pose, loopLight(req.light, phase))
      poseCard(outCtx, face, { pose, backdrop: req.backdrop, caption, gold })
      track.requestFrame()
      onProgress?.({ phase: 'rendering', fraction: (i / WEBM_FRAMES) * 0.92 })
    }
    await sleep(frameMs * 2)
    onProgress?.({ phase: 'encoding', fraction: 0.96 })
    rec.stop()
    await stopped
    onProgress?.({ phase: 'done', fraction: 1 })
    return new Blob(chunks, { type: support.mimeType.split(';')[0] })
  } catch (error) {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      await stopped
    }
    throw error
  } finally {
    track?.stop()
    composer.dispose()
  }
}
