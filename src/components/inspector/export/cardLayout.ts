import type { MaterialLayout, Rect } from '../../refractor/material/cardMaterialProgram'

/*
  The card's print geometry in one place, for any card width. The DOM sizes every
  printed thing inside the card in --rfxu (1% of the card width) over a 13px rim
  (16px on the 1/1) and a 9px corner, at the 360px reference width. The export
  painter and the shader read these same numbers, so the file is the card.
*/

export const CARD_ASPECT = 7 / 5
export const REFERENCE_WIDTH = 360

export interface CardLayout extends MaterialLayout {
  /** one --rfxu at this width */
  u: number
  /** the field box (the card minus its rim) */
  field: Rect
  /** the print column inside the field */
  inner: Rect
  /** the cue plate */
  plate: Rect
  /** the source chip's box inside the window */
  chip: Rect
  /** the varsity number box at the top right of the header */
  numberBox: Rect
  gold: boolean
}

export interface CardLayoutOptions {
  width: number
  gold: boolean
  /** whether the bottom strip prints (it does wherever the card links to its file) */
  strip?: boolean
  /** measured height of the cue plate's content in rfxu, when the painter knows it */
  plateContentU?: number
}

export function cardLayout({ width, gold, strip = true, plateContentU }: CardLayoutOptions): CardLayout {
  const height = Math.round(width * CARD_ASPECT)
  const scale = width / REFERENCE_WIDTH
  const u = width / 100
  const pad = (gold ? 16 : 13) * scale
  const radius = 9 * scale
  const fieldRadius = 4 * scale
  const field: Rect = { x: pad, y: pad, w: width - 2 * pad, h: height - 2 * pad }
  const inset = 3.06 * u
  const innerBottom = 2.5 * u
  const inner: Rect = { x: field.x + inset, y: field.y + inset, w: field.w - 2 * inset, h: field.h - inset - innerBottom }

  // the header: overline, the name, and the file number, padded .83u around and 2.22u below
  const headH = 0.83 + 2 + 0.83 + 7.2 * 0.95 + 2.22
  const head: Rect = { x: inner.x, y: inner.y, w: inner.w, h: headH * u }
  // the media window: full width, 10:9
  const window: Rect = { x: inner.x, y: head.y + head.h, w: inner.w, h: inner.w * 0.9 }
  const stripH = strip ? (1.67 + 2.5 * 1.2) * u : 0
  const stripRect: Rect = { x: inner.x, y: inner.y + inner.h - stripH, w: inner.w, h: stripH }
  // the plate takes what is left, never less than its own content
  const plateTop = window.y + window.h + 2.5 * u
  const plateMin = (plateContentU ?? 20) * u
  const plateH = Math.max(plateMin, stripRect.y - plateTop)
  const plate: Rect = { x: inner.x, y: plateTop, w: inner.w, h: plateH }
  const chipH = 0.83 * 2 * u + 2.22 * u
  // 3.5u in from the window's corner, where the bezel curves, as the page sets it
  const chip: Rect = { x: window.x + 3.5 * u, y: window.y + window.h - 3.5 * u - chipH, w: 0, h: chipH }
  const numberBox: Rect = { x: head.x + head.w - 10.56 * u, y: head.y + 0.83 * u, w: 10.56 * u, h: 7.2 * u }

  return {
    width,
    height,
    pad,
    radius,
    fieldRadius,
    window,
    windowRadius: [21.67 * u, 3.89 * u],
    head,
    strip: stripRect,
    u,
    field,
    inner,
    plate,
    chip,
    numberBox,
    gold,
  }
}
