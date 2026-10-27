/*
  Finger labels sit at their fingertips, and adjacent fingertips land on almost
  the same spot once the ball is turned (index and middle seen from above, or on
  a phone-width stage). This nudges the labels apart up and down and back inside
  the frame, never sideways off their finger. Shared by the 3D pins (screen
  pixels) and the flat drawing (SVG units).
*/

/** A label's centre and size. A zero-size box is hidden and left alone. */
export interface LabelBox {
  x: number
  y: number
  w: number
  h: number
}

export function declutterLabels(
  boxes: LabelBox[],
  bounds: { width: number; height: number },
  { gap = 4, margin = 4, iterations = 24 }: { gap?: number; margin?: number; iterations?: number } = {},
): { x: number; y: number }[] {
  const clamp = (v: number, half: number, size: number) =>
    half * 2 + margin * 2 > size ? size / 2 : Math.min(Math.max(v, margin + half), size - margin - half)
  const placed = boxes.map((b) =>
    b.w > 0 && b.h > 0
      ? { x: clamp(b.x, b.w / 2, bounds.width), y: clamp(b.y, b.h / 2, bounds.height) }
      : { x: b.x, y: b.y },
  )
  const live = boxes.flatMap((b, i) => (b.w > 0 && b.h > 0 ? [i] : []))

  for (let pass = 0; pass < iterations; pass++) {
    let moved = false
    for (let p = 0; p < live.length; p++) {
      for (let q = p + 1; q < live.length; q++) {
        const i = live[p]
        const j = live[q]
        const a = placed[i]
        const b = placed[j]
        if (Math.abs(a.x - b.x) >= (boxes[i].w + boxes[j].w) / 2) continue
        const need = (boxes[i].h + boxes[j].h) / 2 + gap - Math.abs(a.y - b.y)
        if (need <= 1e-6) continue
        // ties keep reading order: the earlier label goes up
        const dir = b.y > a.y || (b.y === a.y && i < j) ? 1 : -1
        // split the push; whatever one label can't take at an edge, the other takes
        const aUp = clamp(a.y - (dir * need) / 2, boxes[i].h / 2, bounds.height)
        const bDue = need - Math.abs(aUp - a.y)
        const bDown = clamp(b.y + dir * bDue, boxes[j].h / 2, bounds.height)
        a.y = clamp(aUp - dir * (bDue - Math.abs(bDown - b.y)), boxes[i].h / 2, bounds.height)
        b.y = bDown
        moved = true
      }
    }
    if (!moved) break
  }
  return placed
}
