import type { ExportBackdrop, ExportPose } from './types'

/*
  The composed face, posed: a perspective-tilted card with a thin stock edge, a
  contact shadow and a cast shadow that follow the tilt, on a dark or transparent
  backdrop, with the caption plate under it. The warp is a plain 2D canvas: the
  face is drawn as a grid of small affine triangles, which is all a card this flat
  needs, and it keeps three.js off the export path.
*/

type Ctx = CanvasRenderingContext2D

export const VOID = '#070509'

export interface PoseOptions {
  pose: ExportPose
  backdrop: ExportBackdrop
  caption: string
  gold: boolean
  /** margin around the card as a fraction of the card width */
  marginRatio?: number
}

export interface PoseDimensions {
  width: number
  height: number
  margin: number
  captionH: number
}

/** The output size for a face of the given size. */
export function poseDimensions(faceW: number, faceH: number, marginRatio = 0.1): PoseDimensions {
  const margin = Math.round(faceW * marginRatio)
  const captionH = Math.round(faceW * 0.075)
  return { width: faceW + margin * 2, height: faceH + margin * 2 + captionH, margin, captionH }
}

interface Pt { x: number; y: number }

/** The card's corners after rotateX(ry) rotateY(rx), projected onto the output. */
export function projectCorners(faceW: number, faceH: number, pose: ExportPose, cx: number, cy: number): [Pt, Pt, Pt, Pt] {
  const d = faceW * (1500 / 360) // the CSS perspective, scaled from the 360px reference card
  const project = (x: number, y: number): Pt => {
    const phi = (pose.rx * Math.PI) / 180
    const theta = (pose.ry * Math.PI) / 180
    const x1 = x * Math.cos(phi)
    const z1 = -x * Math.sin(phi)
    const y2 = y * Math.cos(theta) - z1 * Math.sin(theta)
    const z2 = y * Math.sin(theta) + z1 * Math.cos(theta)
    const s = d / (d - z2)
    return { x: cx + x1 * s, y: cy + y2 * s }
  }
  const hw = faceW / 2
  const hh = faceH / 2
  return [project(-hw, -hh), project(hw, -hh), project(hw, hh), project(-hw, hh)]
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/** Bilinear point on the projected quad (a flat card's projection is close enough to bilinear for this grid). */
function quadPoint(q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt {
  const top = lerp(q[0], q[1], u)
  const bottom = lerp(q[3], q[2], u)
  return lerp(top, bottom, v)
}

function pathQuad(ctx: Ctx, q: [Pt, Pt, Pt, Pt], expand = 0) {
  const cx = (q[0].x + q[1].x + q[2].x + q[3].x) / 4
  const cy = (q[0].y + q[1].y + q[2].y + q[3].y) / 4
  ctx.beginPath()
  q.forEach((p, i) => {
    const dx = p.x - cx
    const dy = p.y - cy
    const len = Math.hypot(dx, dy) || 1
    const x = p.x + (dx / len) * expand
    const y = p.y + (dy / len) * expand
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
}

function drawTriangle(
  ctx: Ctx,
  img: CanvasImageSource,
  src: { sx: number; sy: number; sw: number; sh: number },
  p: [Pt, Pt, Pt],
  t: [Pt, Pt, Pt],
) {
  // affine map from texture (relative to the source rect) to screen
  const [u0, v0, u1, v1, u2, v2] = [t[0].x - src.sx, t[0].y - src.sy, t[1].x - src.sx, t[1].y - src.sy, t[2].x - src.sx, t[2].y - src.sy]
  const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)
  if (Math.abs(det) < 1e-6) return
  const a = ((p[1].x - p[0].x) * (v2 - v0) - (p[2].x - p[0].x) * (v1 - v0)) / det
  const b = ((p[1].y - p[0].y) * (v2 - v0) - (p[2].y - p[0].y) * (v1 - v0)) / det
  const c = ((p[2].x - p[0].x) * (u1 - u0) - (p[1].x - p[0].x) * (u2 - u0)) / det
  const d = ((p[2].y - p[0].y) * (u1 - u0) - (p[1].y - p[0].y) * (u2 - u0)) / det
  const e = p[0].x - a * u0 - c * v0
  const f = p[0].y - b * u0 - d * v0
  // clip to the triangle, grown by a hair so neighbouring cells do not show a seam
  const cx = (p[0].x + p[1].x + p[2].x) / 3
  const cy = (p[0].y + p[1].y + p[2].y) / 3
  ctx.save()
  ctx.beginPath()
  p.forEach((pt, i) => {
    const dx = pt.x - cx
    const dy = pt.y - cy
    const len = Math.hypot(dx, dy) || 1
    const x = pt.x + (dx / len) * 0.7
    const y = pt.y + (dy / len) * 0.7
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  ctx.clip()
  ctx.setTransform(a, b, c, d, e, f)
  ctx.drawImage(img, src.sx, src.sy, src.sw, src.sh, 0, 0, src.sw, src.sh)
  ctx.restore()
}

/** Warp the face onto the projected quad with a grid of affine triangles. */
export function drawWarped(ctx: Ctx, face: HTMLCanvasElement, q: [Pt, Pt, Pt, Pt], cols = 18, rows = 26) {
  const w = face.width
  const h = face.height
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = c / cols
      const u1 = (c + 1) / cols
      const v0 = r / rows
      const v1 = (r + 1) / rows
      const sx = Math.max(0, Math.floor(u0 * w) - 1)
      const sy = Math.max(0, Math.floor(v0 * h) - 1)
      const sw = Math.min(w - sx, Math.ceil(u1 * w) - sx + 1)
      const sh = Math.min(h - sy, Math.ceil(v1 * h) - sy + 1)
      const src = { sx, sy, sw, sh }
      const p00 = quadPoint(q, u0, v0)
      const p10 = quadPoint(q, u1, v0)
      const p11 = quadPoint(q, u1, v1)
      const p01 = quadPoint(q, u0, v1)
      const t00 = { x: u0 * w, y: v0 * h }
      const t10 = { x: u1 * w, y: v0 * h }
      const t11 = { x: u1 * w, y: v1 * h }
      const t01 = { x: u0 * w, y: v1 * h }
      drawTriangle(ctx, face, src, [p00, p10, p11], [t00, t10, t11])
      drawTriangle(ctx, face, src, [p00, p11, p01], [t00, t11, t01])
    }
  }
}

/** Paint the posed card and its caption into `ctx` (sized by poseDimensions). */
export function poseCard(ctx: Ctx, face: HTMLCanvasElement, { pose, backdrop, caption, gold, marginRatio = 0.1 }: PoseOptions): void {
  const faceW = face.width
  const faceH = face.height
  const dims = poseDimensions(faceW, faceH, marginRatio)
  const s = faceW / 360
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, dims.width, dims.height)
  if (backdrop === 'void') {
    ctx.fillStyle = VOID
    ctx.fillRect(0, 0, dims.width, dims.height)
    const glow = ctx.createRadialGradient(dims.width / 2, dims.margin + faceH * 0.4, 0, dims.width / 2, dims.margin + faceH * 0.4, faceW * 0.9)
    glow.addColorStop(0, gold ? 'rgba(80,38,12,.42)' : 'rgba(40,44,50,.4)')
    glow.addColorStop(1, 'rgba(7,5,9,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, dims.width, dims.height)
  }

  const cx = dims.width / 2
  const cy = dims.margin + faceH / 2
  const quad = projectCorners(faceW, faceH, pose, cx, cy)

  // the cast shadow follows the tilt; the contact shadow sits under the near edge
  ctx.save()
  ctx.filter = `blur(${Math.round(26 * s)}px)`
  const shifted = quad.map((p) => ({ x: p.x - pose.rx * 1.2 * s, y: p.y + 34 * s + pose.ry * 1 * s })) as [Pt, Pt, Pt, Pt]
  pathQuad(ctx, shifted, -6 * s)
  ctx.fillStyle = 'rgba(0,0,0,.78)'
  ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.filter = `blur(${Math.round(9 * s)}px)`
  pathQuad(ctx, quad.map((p) => ({ x: p.x, y: p.y + 8 * s })) as [Pt, Pt, Pt, Pt], -2 * s)
  ctx.fillStyle = 'rgba(0,0,0,.6)'
  ctx.fill()
  ctx.restore()

  // the stock's thickness: the CSS edge stack, bottom to top
  const edge: Array<[number, string]> = gold
    ? [[7, '#130b05'], [4, '#46240e']]
    : [[9, '#08090b'], [7, '#42464b'], [5, '#101114'], [3, '#35383c']]
  for (const [dy, color] of edge) {
    pathQuad(ctx, quad.map((p) => ({ x: p.x, y: p.y + dy * s })) as [Pt, Pt, Pt, Pt], 3 * s)
    ctx.fillStyle = color
    ctx.fill()
  }
  // the outer rings
  pathQuad(ctx, quad, 3 * s)
  ctx.fillStyle = gold ? '#000' : '#09090b'
  ctx.fill()
  if (gold) {
    pathQuad(ctx, quad, 7 * s)
    ctx.strokeStyle = 'rgba(191,87,0,.3)'
    ctx.lineWidth = 1 * s
    ctx.stroke()
    pathQuad(ctx, quad, 4 * s)
    ctx.strokeStyle = '#8f4a16'
    ctx.lineWidth = 1 * s
    ctx.stroke()
  } else {
    pathQuad(ctx, quad, 1 * s)
    ctx.strokeStyle = 'rgba(185,198,204,.4)'
    ctx.lineWidth = 1 * s
    ctx.stroke()
  }

  drawWarped(ctx, face, quad)

  // the caption plate
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const fontPx = Math.max(12, Math.round(faceW * 0.0145))
  ctx.font = `400 ${fontPx}px "Martian Mono"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const maxW = dims.width - dims.margin * 1.2
  const lines = wrapCaption(ctx, caption, maxW)
  const lineH = fontPx * 1.6
  const plateH = lines.length * lineH + fontPx * 1.2
  const plateY = dims.height - dims.captionH / 2 - plateH / 2
  if (backdrop === 'transparent') {
    const plateW = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + fontPx * 2.4)
    ctx.beginPath()
    ctx.roundRect(cx - plateW / 2, plateY, plateW, plateH, fontPx * 0.6)
    ctx.fillStyle = 'rgba(7,5,9,.82)'
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(246,241,230,.84)'
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, plateY + fontPx * 0.6 + lineH * (i + 0.5))
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function wrapCaption(ctx: Ctx, caption: string, maxW: number): string[] {
  if (ctx.measureText(caption).width <= maxW) return [caption]
  const parts = caption.split(' · ')
  const lines: string[] = []
  let line = ''
  for (const part of parts) {
    const next = line ? `${line} · ${part}` : part
    if (ctx.measureText(next).width <= maxW || !line) line = next
    else {
      lines.push(line)
      line = part
    }
  }
  if (line) lines.push(line)
  return lines
}
