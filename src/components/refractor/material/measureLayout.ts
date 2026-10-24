import { EMPTY_RECT, type MaterialLayout, type Rect } from './cardMaterialProgram'

/*
  Where the print sits on the card, in CSS pixels of the card box. Measured along the
  offsetParent chain (layout boxes, unaffected by the tilt transform) so the shader's
  coverage masks land on the header, the media window and the strip exactly.
*/

function layoutRect(el: HTMLElement | null, root: HTMLElement): Rect {
  if (!el) return EMPTY_RECT
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

function px(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/** Measure the card's print geometry. */
export function measureLayout(card: HTMLElement): MaterialLayout {
  const cs = getComputedStyle(card)
  const field = card.querySelector<HTMLElement>('.rfx-field')
  const stage = card.querySelector<HTMLElement>('.rfx-stage')
  const stageStyle = stage ? getComputedStyle(stage) : null
  return {
    width: card.offsetWidth,
    height: card.offsetHeight,
    pad: px(cs.paddingLeft),
    radius: px(cs.borderTopLeftRadius),
    fieldRadius: field ? px(getComputedStyle(field).borderTopLeftRadius) : 4,
    window: layoutRect(stage, card),
    windowRadius: [
      stageStyle ? px(stageStyle.borderTopLeftRadius) : 0,
      stageStyle ? px(stageStyle.borderBottomLeftRadius) : 0,
    ],
    head: layoutRect(card.querySelector<HTMLElement>('.rfx-head'), card),
    strip: layoutRect(card.querySelector<HTMLElement>('.rfx-strip'), card),
  }
}

