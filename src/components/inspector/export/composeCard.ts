import { CONFIDENCE_META, type PitchAtlasEntry } from '../../../data/types'
import { gripEntryFor } from '../../../data/grips'
import { accentForSlug, accentInk } from '../../refractor/accents'
import { createCardMaterialProgram, EMPTY_RECT, hexToTriple, type CardMaterialProgram, type MaterialIdentity } from '../../refractor/material/cardMaterialProgram'
import { CARD_INK } from '../../refractor/specimenFace'
import type { CardMaterial } from '../../refractor/material/materialPresets'
import { cardLayout, type CardLayout } from './cardLayout'
import type { ExportFace, ExportLight, ExportPose } from './types'

/*
  One face of the card, painted flat. The order is the DOM's: the media first,
  clipped to the window; the material over it (opaque stock and foil on the rim and
  the field, only a glaze inside the window); then the print — the window's bezel,
  the source chip, the header, the cue plate, the strip. Every word comes from the
  record. Text is painted natively, so it is as crisp as the canvas is large.
*/

const BONE = '#F6F1E6'
const BONE_2 = '#D8CFB8'
const PLATE = '#EFE6D0'
const INK_CUE = '#37322A'
const INK_FACT = '#4A443A'
const INK_META = '#746B5D'

export const FONT_FAMILIES = ['Anton', 'Martian Mono', 'Newsreader', 'Hanken Grotesk'] as const

export async function loadCardFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return
  await Promise.all([
    document.fonts.load('400 40px Anton'),
    document.fonts.load('400 20px "Martian Mono"'),
    document.fonts.load('700 20px "Martian Mono"'),
    document.fonts.load('italic 400 30px Newsreader'),
    document.fonts.load('400 20px "Hanken Grotesk"'),
  ]).catch(() => undefined)
}

/** What the front prints, as strings. Pure, so a test can read the card without a canvas. */
export interface FrontText {
  overline: string
  name: string
  fileLabel: string
  number: string
  chip: string
  readLabel: string
  serial: string
  cue: string
  confidence: string
  approx: boolean
  strip: [string, string]
}

export function frontText(entry: PitchAtlasEntry): FrontText {
  const { canonical, display } = entry
  const grip = gripEntryFor(display.slug)
  const own = Boolean(grip?.clip || (grip && grip.photos.length > 0))
  const referenceClaim = canonical.gripDetails[0] ?? canonical.grip
  const cue = own && grip ? grip.shortCue : referenceClaim.value
  const tier = own && grip ? grip.claimTier : referenceClaim.confidence
  return {
    overline: 'Filed specimen',
    name: display.shortName,
    fileLabel: 'File',
    number: display.specimenNo,
    chip: grip?.clip ? 'Austin video' : grip && grip.photos.length > 0 ? 'Austin photo' : 'Reference schematic',
    readLabel: 'Grip tell',
    serial: `PA—${display.specimenNo}`,
    cue,
    confidence: CONFIDENCE_META[tier].label,
    approx: own ? false : Boolean(referenceClaim.approximate),
    strip: ['Grip / release / shape', 'Open specimen →'],
  }
}

export interface BackText {
  name: string
  number: string
  rows: Array<{ key: string; value: string; confidence: string; approx: boolean; source?: string }>
  file: string
}

export function backText(entry: PitchAtlasEntry): BackText {
  const { canonical, display } = entry
  const gripCue = canonical.gripDetails[0] ?? canonical.grip
  const shape = canonical.physics.shape
  const familyLabel = canonical.family === 'breaking' ? 'Breaking' : canonical.family === 'offspeed' ? 'Offspeed' : 'Fastball'
  return {
    name: display.shortName,
    number: `No. ${display.specimenNo} · ${familyLabel}`,
    rows: [
      { key: 'Grip cue', value: gripCue.value, confidence: CONFIDENCE_META[gripCue.confidence].label, approx: Boolean(gripCue.approximate), source: gripCue.source ? `Grip: ${gripCue.source.label}` : undefined },
      { key: 'Shape', value: shape.value, confidence: CONFIDENCE_META[shape.confidence].label, approx: Boolean(shape.approximate), source: shape.source ? `Shape: ${shape.source.label}` : undefined },
    ],
    file: 'Open the full file →',
  }
}

/** The tier dot colours the DOM uses on the plate, resolved to hex for the canvas. */
const INK_HEX: Record<string, string> = {
  'var(--color-tier-first-ink)': '#BF5700',
  'var(--color-tier-relayed-ink)': '#1F3A5F',
  'var(--color-tier-unverified-ink)': '#6E675A',
}

type Ctx = CanvasRenderingContext2D

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number | [number, number, number, number]) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, typeof r === 'number' ? r : [r[0], r[1], r[2], r[3]])
}

function fitText(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

function wrapLines(ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) line = next
    else {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines && line && !lines.includes(line)) {
    lines[maxLines - 1] = fitText(ctx, `${lines[maxLines - 1]} ${line}`, maxWidth)
  }
  return lines
}

/** The DOM's object-fit: cover crop of a media box into the window. */
function coverDraw(ctx: Ctx, source: CanvasImageSource, sw: number, sh: number, box: { x: number; y: number; w: number; h: number }, focusY: number, scale: number) {
  const ratio = Math.max(box.w / sw, box.h / sh) * scale
  const dw = sw * ratio
  const dh = sh * ratio
  const dx = box.x + (box.w - dw) / 2
  const dy = box.y + (box.h - dh) * focusY
  ctx.drawImage(source, dx, dy, dw, dh)
}

function mediaSize(el: HTMLVideoElement | HTMLImageElement): [number, number] {
  if (el instanceof HTMLVideoElement) return [el.videoWidth || 1, el.videoHeight || 1]
  return [el.naturalWidth || 1, el.naturalHeight || 1]
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const box = svg.viewBox.baseVal
  const w = box?.width || svg.clientWidth || 300
  const h = box?.height || svg.clientHeight || 300
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('The schematic could not be drawn.'))
    }
    img.src = url
  })
}

export interface StageMedia {
  kind: 'video' | 'image' | 'schematic'
  source: CanvasImageSource
  width: number
  height: number
}

const MEDIA_WAIT_MS = 8000
const MEDIA_POLL_MS = 100

/** What the export says when a clip or photo face has not arrived in time. */
export const MEDIA_NOT_READY = 'The grip media has not finished loading. Give it a moment, then export again.'

const videoReady = (v: HTMLVideoElement) => v.readyState >= 2 && v.videoWidth > 0
const imageReady = (i: HTMLImageElement) => i.complete && i.naturalWidth > 0

/**
  Pick the live media the visitor is looking at: the playing clip, its poster, or the
  drawn seam. A clip or photo face waits a few seconds for the moving frame or its
  still to arrive, then refuses: an export never ships an empty window under the
  media's credit.
*/
export async function resolveStageMedia(
  stage: HTMLElement | null | undefined,
  { waitMs = MEDIA_WAIT_MS }: { waitMs?: number } = {},
): Promise<StageMedia | null> {
  if (!stage) return null
  const video = stage.querySelector<HTMLVideoElement>('video')
  const img = stage.querySelector<HTMLImageElement>('img.rfx-grip-img')
  if (video || img) {
    const deadline = Date.now() + waitMs
    for (;;) {
      if (video && videoReady(video)) {
        const [w, h] = mediaSize(video)
        return { kind: 'video', source: video, width: w, height: h }
      }
      if (img && imageReady(img)) {
        const [w, h] = mediaSize(img)
        return { kind: 'image', source: img, width: w, height: h }
      }
      if (Date.now() >= deadline) throw new Error(MEDIA_NOT_READY)
      await new Promise<void>((resolve) => window.setTimeout(resolve, MEDIA_POLL_MS))
    }
  }
  const svg = stage.querySelector<SVGSVGElement>('svg')
  if (svg) {
    const image = await svgToImage(svg)
    return { kind: 'schematic', source: image, width: image.naturalWidth || 300, height: image.naturalHeight || 300 }
  }
  return null
}

export interface Composer {
  /** paints the face for a pose and light into `target` (sized layout.width × layout.height) */
  draw(target: Ctx, pose: ExportPose, light: ExportLight): void
  layout: CardLayout
  dispose(): void
}

export interface ComposeOptions {
  entry: PitchAtlasEntry
  face: ExportFace
  material: CardMaterial
  width: number
  media: StageMedia | null
}

/** Build a composer: the print and the media are painted once; the material re-renders per pose. */
export function createComposer({ entry, face, material, width, media }: ComposeOptions): Composer {
  const { display } = entry
  const gold = display.specimenNo === '00' && face === 'front'
  const accent = accentForSlug(display.slug)
  const layout = cardLayout({ width, gold, strip: face === 'front' })
  const { height } = layout
  // The back has no media window, header or strip, so its stock covers the whole
  // field, as it does on the page; with the front's window it showed a dark hole.
  const stockLayout: CardLayout = face === 'back' ? { ...layout, window: EMPTY_RECT, head: EMPTY_RECT, strip: EMPTY_RECT } : layout

  const glCanvas = document.createElement('canvas')
  let program: CardMaterialProgram | null = null
  try {
    program = createCardMaterialProgram(glCanvas)
    program.resize(layout.width, layout.height, 1)
  } catch {
    program = null
  }

  const identity: MaterialIdentity = {
    c2: hexToTriple(accent.c2),
    c3: hexToTriple(accent.c3),
    ring: face === 'back' ? hexToTriple('#6e757b') : ringTriple(accent, gold),
    seed: 7,
  }

  // the layers that never change between frames
  const under = document.createElement('canvas')
  under.width = layout.width
  under.height = height
  const over = document.createElement('canvas')
  over.width = layout.width
  over.height = height
  const uc = under.getContext('2d')
  const oc = over.getContext('2d')
  if (!uc || !oc) throw new Error('A drawing surface could not be created.')

  if (face === 'front') paintFrontUnder(uc, layout, accent, media)
  else paintBackUnder(uc, layout, accent)
  if (face === 'front') paintFrontOver(oc, layout, entry, accent, gold, media)
  else paintBackOver(oc, layout, entry, accent)

  // without WebGL the stock is the CSS fallback's dark ramp, painted flat
  const fallbackStock = document.createElement('canvas')
  fallbackStock.width = layout.width
  fallbackStock.height = height
  const fc = fallbackStock.getContext('2d')
  if (fc && !program) paintFallbackStock(fc, stockLayout, accent, gold)

  return {
    layout,
    draw(target, pose, light) {
      target.clearRect(0, 0, layout.width, height)
      roundRectPath(target, 0, 0, layout.width, height, layout.radius)
      target.save()
      target.clip()
      target.drawImage(under, 0, 0)
      if (program) {
        program.render({
          layout: stockLayout,
          identity,
          material: face === 'back' ? { ...material, coverage: 'frame' } : material,
          tilt: { rx: pose.rx, ry: pose.ry },
          light,
        })
        target.drawImage(glCanvas, 0, 0, layout.width, height)
      } else {
        target.drawImage(fallbackStock, 0, 0)
      }
      target.drawImage(over, 0, 0)
      target.restore()
    },
    dispose() {
      program?.dispose()
    },
  }

  function paintFallbackStock(ctx: Ctx, l: CardLayout, a: { c2: string; c3: string }, ember: boolean) {
    const grad = ctx.createLinearGradient(0, 0, l.width, l.height)
    if (ember) {
      grad.addColorStop(0, '#2a1208'); grad.addColorStop(0.38, '#bf5700'); grad.addColorStop(0.5, '#fff0e2'); grad.addColorStop(0.62, '#bf5700'); grad.addColorStop(1, '#2a1208')
    } else {
      grad.addColorStop(0, '#08090a'); grad.addColorStop(0.14, '#bf5700'); grad.addColorStop(0.26, '#fff3ec'); grad.addColorStop(0.42, '#5fe0ea'); grad.addColorStop(0.66, '#6e757b'); grad.addColorStop(0.84, '#bf5700'); grad.addColorStop(1, '#08090a')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, l.width, l.height)
    // the field stays dark
    const f = l.field
    roundRectPath(ctx, f.x, f.y, f.w, f.h, l.fieldRadius)
    const fg = ctx.createLinearGradient(0, f.y, 0, f.y + f.h)
    fg.addColorStop(0, mixHex(a.c2, '#0B0805', 0.34))
    fg.addColorStop(0.52, '#0B0805')
    fg.addColorStop(1, '#070503')
    ctx.fillStyle = fg
    ctx.fill()
    // the window is left open for the media, on a face that has one
    const w = l.window
    if (w.w <= 0 || w.h <= 0) return
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    roundRectPath(ctx, w.x, w.y, w.w, w.h, [l.windowRadius[0], l.windowRadius[0], l.windowRadius[1], l.windowRadius[1]])
    ctx.fill()
    ctx.restore()
  }
}

function ringTriple(accent: { c3: string; finish?: 'powder' | 'teal' }, gold: boolean): [number, number, number] {
  if (gold) return hexToTriple('#bf5700')
  if (accent.finish === 'powder') return hexToTriple('#c41e3a')
  if (accent.finish === 'teal') return hexToTriple('#00b2a9')
  const c3 = hexToTriple(accent.c3)
  const bone = hexToTriple('#f6f1e6')
  return [0, 1, 2].map((i) => c3[i] * 0.42 + bone[i] * 0.29 + 0.03 * 0.29) as [number, number, number]
}

function mixHex(a: string, b: string, t: number): string {
  const ca = hexToTriple(a)
  const cb = hexToTriple(b)
  const c = [0, 1, 2].map((i) => Math.round((ca[i] * t + cb[i] * (1 - t)) * 255))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/* ── the front, under the material: the media in its window ── */
function paintFrontUnder(ctx: Ctx, l: CardLayout, accent: { c2: string; c3: string }, media: StageMedia | null) {
  const w = l.window
  roundRectPath(ctx, w.x, w.y, w.w, w.h, [l.windowRadius[0], l.windowRadius[0], l.windowRadius[1], l.windowRadius[1]])
  ctx.save()
  ctx.clip()
  const g = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h * 0.24, 0, w.x + w.w / 2, w.y + w.h * 0.24, w.w * 0.9)
  g.addColorStop(0, mixHex(accent.c2, '#000000', 0.48))
  g.addColorStop(0.78, '#060403')
  ctx.fillStyle = g
  ctx.fillRect(w.x, w.y, w.w, w.h)
  if (media) {
    if (media.kind === 'schematic') {
      // the seam drawing sits centred, the way RefractorBall fills the stage
      const s = Math.min(w.w / media.width, w.h / media.height)
      ctx.drawImage(media.source, w.x + (w.w - media.width * s) / 2, w.y + (w.h - media.height * s) / 2, media.width * s, media.height * s)
    } else {
      ctx.save()
      if ('filter' in ctx) ctx.filter = 'saturate(.88) contrast(1.05) brightness(.96)'
      coverDraw(ctx, media.source, media.width, media.height, w, media.kind === 'video' ? 0.56 : 0.42, media.kind === 'video' ? 1.02 : 1.16)
      ctx.restore()
      // the DOM's vignette over the hand
      const v = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h * 0.44, w.w * 0.3, w.x + w.w / 2, w.y + w.h * 0.44, w.w * 0.95)
      v.addColorStop(0.46, 'rgba(7,5,3,0)')
      v.addColorStop(1, 'rgba(7,5,3,.58)')
      ctx.fillStyle = v
      ctx.fillRect(w.x, w.y, w.w, w.h)
    }
  }
  ctx.restore()
}

/* ── the front, over the material: bezel, chip, header, plate, strip ── */
function paintFrontOver(ctx: Ctx, l: CardLayout, entry: PitchAtlasEntry, accent: { c3: string }, gold: boolean, media: StageMedia | null) {
  const text = frontText(entry)
  const { u } = l
  const ink = accentInk(accent.c3)
  const inkColor = ink.startsWith('var(') ? BONE : ink
  const radii: [number, number, number, number] = [l.windowRadius[0], l.windowRadius[0], l.windowRadius[1], l.windowRadius[1]]

  // window bezel: dark line, accent line, dark line (the stage's coach-line)
  const w = l.window
  ctx.lineWidth = 2 * (l.width / 360)
  roundRectPath(ctx, w.x + 1, w.y + 1, w.w - 2, w.h - 2, radii)
  ctx.strokeStyle = '#080604'
  ctx.stroke()
  ctx.lineWidth = 1.5 * (l.width / 360)
  roundRectPath(ctx, w.x + 3.5 * (l.width / 360), w.y + 3.5 * (l.width / 360), w.w - 7 * (l.width / 360), w.h - 7 * (l.width / 360), radii)
  ctx.strokeStyle = gold ? 'rgba(191,87,0,.62)' : mixHex(accent.c3, '#a38d72', 0.35)
  ctx.stroke()

  // the source chip
  ctx.font = `400 ${Math.max(7 * (l.width / 360), 2.22 * u)}px "Martian Mono"`
  ctx.textBaseline = 'middle'
  const chipLabel = media?.kind === 'schematic' ? 'Reference schematic' : text.chip
  const chipText = chipLabel.toUpperCase()
  const chipPadX = 2.22 * u
  const chipW = ctx.measureText(chipText).width + chipPadX * 2 + 1.39 * u + 2.22 * u
  const chip = { x: l.chip.x, y: l.chip.y, w: chipW, h: l.chip.h }
  roundRectPath(ctx, chip.x, chip.y, chip.w, chip.h, chip.h / 2)
  ctx.fillStyle = 'rgba(5,7,12,.8)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.lineWidth = 1
  ctx.stroke()
  const dotColor = media?.kind === 'schematic' || text.chip === 'Reference schematic' ? '#CDBA8E' : '#5FE0EA'
  ctx.fillStyle = dotColor
  ctx.beginPath()
  ctx.arc(chip.x + chipPadX + 1.11 * u, chip.y + chip.h / 2, 1.11 * u, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = BONE_2
  ctx.fillText(spaced(chipText, 0.1), chip.x + chipPadX + 2.22 * u + 1.39 * u, chip.y + chip.h / 2 + 0.5)

  // the header
  const h = l.head
  const padX = 0.83 * u
  ctx.textBaseline = 'alphabetic'
  ctx.font = `400 ${Math.max(7 * (l.width / 360), 2 * u)}px "Martian Mono"`
  ctx.fillStyle = mixHex(inkColor, '#D8CFB8', 0.68)
  ctx.fillText(spaced(text.overline.toUpperCase(), 0.17), h.x + padX, h.y + 0.83 * u + 2 * u)
  // the name, athletic, skewed like the DOM
  const nameSize = 7.2 * u
  ctx.save()
  ctx.translate(h.x + padX, h.y + 0.83 * u + 2 * u + 0.83 * u + nameSize * 0.92)
  ctx.transform(1, 0, Math.tan((-5 * Math.PI) / 180), 1, 0, 0)
  ctx.font = `400 ${nameSize}px Anton`
  ctx.lineWidth = 0.6 * (l.width / 360)
  ctx.strokeStyle = 'rgba(0,0,0,.6)'
  ctx.shadowColor = 'rgba(0,0,0,.6)'
  ctx.shadowOffsetX = 1.5 * (l.width / 360)
  ctx.shadowOffsetY = 2 * (l.width / 360)
  ctx.shadowBlur = 1
  ctx.fillStyle = gold ? '#FFD9B8' : '#FBF7EE'
  const nameText = fitText(ctx, text.name.toUpperCase(), h.w - l.numberBox.w - padX * 3)
  ctx.fillText(nameText, 0, 0)
  ctx.shadowColor = 'transparent'
  ctx.strokeText(nameText, 0, 0)
  ctx.restore()
  // the file number, right-aligned, bottom-aligned with the name
  ctx.save()
  ctx.textAlign = 'right'
  const baseY = h.y + 0.83 * u + 2 * u + 0.83 * u + nameSize * 0.92
  ctx.font = `400 ${5.2 * u}px Anton`
  ctx.fillStyle = gold ? '#FFD9B8' : mixHex(inkColor, '#F6F1E6', 0.72)
  ctx.transform(1, 0, Math.tan((-6 * Math.PI) / 180), 1, 0, 0)
  const numberW = ctx.measureText(text.number).width
  ctx.fillText(text.number, h.x + h.w - padX, baseY)
  ctx.font = `400 ${Math.max(7 * (l.width / 360), 2 * u)}px "Martian Mono"`
  ctx.fillStyle = '#9D927D'
  ctx.fillText(spaced(text.fileLabel.toUpperCase(), 0.17), h.x + h.w - padX - numberW - 1.1 * u, baseY - 0.65 * u)
  ctx.restore()

  // the cue plate
  const p = l.plate
  roundRectPath(ctx, p.x, p.y, p.w, p.h, 2.22 * u)
  const pg = ctx.createRadialGradient(p.x + p.w / 2, p.y, 0, p.x + p.w / 2, p.y, p.w * 0.6)
  pg.addColorStop(0, 'rgba(255,252,242,.62)')
  pg.addColorStop(1, 'rgba(255,252,242,0)')
  ctx.fillStyle = PLATE
  ctx.fill()
  ctx.fillStyle = pg
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,.55)'
  ctx.lineWidth = 1
  ctx.stroke()
  // faint ruled lines, like the DOM's repeating gradient
  ctx.save()
  ctx.clip()
  ctx.strokeStyle = 'rgba(74,68,58,.055)'
  for (let y = p.y + 4.7 * u; y < p.y + p.h; y += 4.9 * u) {
    ctx.beginPath()
    ctx.moveTo(p.x, y)
    ctx.lineTo(p.x + p.w, y)
    ctx.stroke()
  }
  ctx.restore()
  const px = p.x + 3.33 * u
  const pw = p.w - 6.66 * u
  // measure the content, then centre the block vertically as the DOM does
  ctx.font = `italic 400 ${3.9 * u}px Newsreader`
  const cueLines = wrapLines(ctx, text.cue, pw, 2)
  const metaH = 2.05 * u
  const cueH = cueLines.length * 3.9 * u * 1.32
  const factsH = 1.67 * u + 2.5 * u * 1.2
  const blockH = metaH + 1.75 * u + cueH + 1.75 * u + factsH
  let y = p.y + Math.max(2.5 * u, (p.h - blockH) / 2)
  ctx.font = `400 ${Math.max(7 * (l.width / 360), 2.05 * u)}px "Martian Mono"`
  ctx.fillStyle = INK_META
  ctx.textBaseline = 'top'
  ctx.fillText(spaced(text.readLabel.toUpperCase(), 0.15), px, y)
  ctx.textAlign = 'right'
  ctx.fillText(spaced(text.serial.toUpperCase(), 0.15), px + pw, y)
  ctx.textAlign = 'left'
  y += metaH + 1.75 * u
  ctx.font = `italic 400 ${3.9 * u}px Newsreader`
  ctx.fillStyle = INK_CUE
  for (const line of cueLines) {
    ctx.fillText(line, px, y)
    y += 3.9 * u * 1.32
  }
  y += 1.75 * u
  ctx.strokeStyle = 'rgba(33,29,23,.16)'
  ctx.beginPath()
  ctx.moveTo(px, y)
  ctx.lineTo(px + pw, y)
  ctx.stroke()
  y += 1.67 * u
  const dotY = y + 1.5 * u
  const confidence = CARD_INK_HEX(entry)
  ctx.fillStyle = confidence
  ctx.shadowColor = confidence
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.arc(px + 1.11 * u, dotY, 1.11 * u, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.font = `400 ${Math.max(8 * (l.width / 360), 2.5 * u)}px "Martian Mono"`
  ctx.fillStyle = INK_FACT
  ctx.fillText(spaced(text.confidence.toUpperCase(), 0.07), px + 2.22 * u + 1.4 * u, y)
  if (text.approx) {
    const label = '≈ APPROX'
    const lx = px + 2.22 * u + 1.4 * u + ctx.measureText(spaced(text.confidence.toUpperCase(), 0.07)).width + 3.6 * u
    ctx.strokeStyle = '#6E5E3A'
    ctx.fillStyle = '#6E5E3A'
    roundRectPath(ctx, lx - 1.67 * u, y - 0.6 * u, ctx.measureText(label).width + 3.34 * u, 2.5 * u * 1.2 + 1.2 * u, 99)
    ctx.stroke()
    ctx.fillText(label, lx, y)
  }

  // the strip
  const s = l.strip
  if (s.h > 0) {
    ctx.textBaseline = 'middle'
    ctx.font = `400 ${Math.max(8 * (l.width / 360), 2.5 * u)}px "Martian Mono"`
    ctx.shadowColor = 'rgba(0,0,0,.85)'
    ctx.shadowOffsetY = 1
    ctx.shadowBlur = 3
    const sy = s.y + 1.67 * u + (s.h - 1.67 * u) / 2
    ctx.fillStyle = mixHex(inkColor, '#D8CFB8', 0.58)
    ctx.font = `400 ${Math.max(8 * (l.width / 360), 2.5 * u) * 0.86}px "Martian Mono"`
    ctx.fillText(spaced(text.strip[0].toUpperCase(), 0.1), s.x, sy)
    ctx.font = `400 ${Math.max(8 * (l.width / 360), 2.5 * u)}px "Martian Mono"`
    ctx.fillStyle = BONE_2
    ctx.textAlign = 'right'
    ctx.fillText(spaced(text.strip[1].toUpperCase(), 0.08), s.x + s.w, sy)
    ctx.textAlign = 'left'
    ctx.shadowColor = 'transparent'
  }
  ctx.textBaseline = 'alphabetic'
}

function CARD_INK_HEX(entry: PitchAtlasEntry): string {
  const grip = gripEntryFor(entry.display.slug)
  const own = Boolean(grip?.clip || (grip && grip.photos.length > 0))
  const tier = own && grip ? grip.claimTier : (entry.canonical.gripDetails[0] ?? entry.canonical.grip).confidence
  return INK_HEX[CARD_INK[tier]] ?? '#BF5700'
}

/** letter-spacing for canvas text: thin spaces are not available, so the glyphs are spaced by hand */
function spaced(text: string, em: number): string {
  if (em <= 0) return text
  // hair spaces approximate tracking without per-glyph fillText calls
  const hair = em >= 0.14 ? '  ' : ' '
  return text.split('').join(hair)
}

/* ── the back ── */
function paintBackUnder(ctx: Ctx, l: CardLayout, accent: { c3: string }) {
  const g = ctx.createRadialGradient(l.width / 2, 0, 0, l.width / 2, 0, l.height)
  g.addColorStop(0, '#15120f')
  g.addColorStop(1, '#0a0908')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, l.width, l.height)
  ctx.fillStyle = mixHex(accent.c3, '#0a0908', 0.04)
  ctx.fillRect(0, 0, l.width, l.height)
}

function paintBackOver(ctx: Ctx, l: CardLayout, entry: PitchAtlasEntry, accent: { c3: string }) {
  const text = backText(entry)
  const s = l.width / 360
  const pad = 15 * s + l.pad
  const x = pad
  let y = pad
  const w = l.width - pad * 2
  ctx.textBaseline = 'top'
  // head: name and number on one line
  ctx.font = `400 ${24 * s}px Anton`
  ctx.fillStyle = BONE
  ctx.fillText(text.name.toUpperCase(), x, y)
  ctx.font = `400 ${9 * s}px "Martian Mono"`
  ctx.fillStyle = BONE_2
  ctx.textAlign = 'right'
  ctx.fillText(spaced(text.number.toUpperCase(), 0.14), x + w, y + 10 * s)
  ctx.textAlign = 'left'
  y += 24 * s * 0.95 + 9 * s
  ctx.strokeStyle = 'rgba(246,241,230,.14)'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
  y += 9 * s
  // rows
  const rowsTop = y
  ctx.font = `400 ${12 * s}px "Hanken Grotesk"`
  const keyW = 56 * s
  const gap = 9 * s
  const rowPadX = 9 * s
  const rowPadY = 7 * s
  const valueW = w - keyW - gap - rowPadX * 2
  const rows = text.rows.map((row) => ({ row, lines: wrapLines(ctx, row.value, valueW, 2) }))
  rows.forEach(({ row, lines }, i) => {
    const rowH = rowPadY * 2 + lines.length * 12 * s * 1.42 + 4 * s + 8 * s * 1.2
    if (i % 2 === 1) {
      ctx.fillStyle = mixHex(accent.c3, '#0a0908', 0.14)
      ctx.fillRect(x, y, w, rowH)
    }
    ctx.font = `400 ${8 * s}px "Martian Mono"`
    ctx.fillStyle = BONE_2
    ctx.fillText(spaced(row.key.toUpperCase(), 0.12), x + rowPadX, y + rowPadY + 2 * s)
    ctx.font = `400 ${12 * s}px "Hanken Grotesk"`
    ctx.fillStyle = BONE
    let ly = y + rowPadY
    for (const line of lines) {
      ctx.fillText(line, x + rowPadX + keyW + gap, ly)
      ly += 12 * s * 1.42
    }
    ly += 4 * s
    ctx.fillStyle = '#BF5700'
    ctx.beginPath()
    ctx.arc(x + rowPadX + keyW + gap + 3 * s, ly + 4 * s, 3 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = `400 ${8 * s}px "Martian Mono"`
    ctx.fillStyle = BONE_2
    ctx.fillText(spaced(`${row.confidence}${row.approx ? ' · APPROX' : ''}`.toUpperCase(), 0.1), x + rowPadX + keyW + gap + 10 * s, ly)
    y += rowH
    ctx.strokeStyle = 'rgba(246,241,230,.06)'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.stroke()
  })
  roundRectPath(ctx, x, rowsTop, w, y - rowsTop, 7 * s)
  ctx.strokeStyle = 'rgba(246,241,230,.08)'
  ctx.stroke()
  // foot: sources and the route into the file
  let fy = l.height - pad
  ctx.font = `400 ${10 * s}px "Martian Mono"`
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = BONE
  ctx.fillText(spaced(text.file.toUpperCase(), 0.14), x, fy)
  fy -= 10 * s * 1.6 + 8 * s
  ctx.fillStyle = BONE_2
  for (const row of [...text.rows].reverse()) {
    if (!row.source) continue
    const label = fitText(ctx, spaced(row.source.toUpperCase(), 0.1), w)
    ctx.fillText(label, x, fy)
    const tw = ctx.measureText(label).width
    ctx.strokeStyle = 'rgba(216,207,184,.4)'
    ctx.beginPath()
    ctx.moveTo(x, fy + 2 * s)
    ctx.lineTo(x + tw, fy + 2 * s)
    ctx.stroke()
    fy -= 10 * s * 1.6 + 8 * s
  }
  ctx.textBaseline = 'alphabetic'
}
