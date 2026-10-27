/*
  Finger labels sit at their fingertips, and adjacent fingertips land on almost
  the same spot once the ball is turned (index and middle seen from above, or on
  a phone-width stage). This nudges the labels apart up and down and back inside
  the frame, never sideways off their finger. Shared by the 3D pins (screen
  pixels) and the flat drawing (SVG units).
*/

/** A label's centre and size. A zero-size box is hidden and left alone. A fixed
    box (a fingertip's dot) never moves: labels go around it. */
export interface LabelBox {
  x: number
  y: number
  w: number
  h: number
  fixed?: boolean
}

/** Which side of its fingertip a name runs (-1 left, 1 right): the way the finger
    points (`lean`), unless only the other side has room, or the plate would lie
    across another finger while the other side is clear. `spill` is how far a
    plate on that side runs past the frame; one within `slack` still squeezes in. */
export function plateSide(
  lean: number,
  spill: (side: number) => number,
  slack: number,
  crossed: (side: number) => boolean,
): number {
  const side = spill(lean) <= slack || spill(-lean) > 0 ? lean : -lean
  return crossed(side) && spill(-side) <= slack && !crossed(-side) ? -side : side
}

/** Whether a drawn line (a finger) comes within `pad` of a box. Only segments
    whose two ends both show count: a finger behind the ball, or past the
    drawing's rim, is not in the way. */
export function lineNearBox(
  points: { x: number; y: number }[],
  box: LabelBox,
  pad: number,
  shows: (i: number) => boolean = () => true,
): boolean {
  const x0 = box.x - box.w / 2 - pad
  const x1 = box.x + box.w / 2 + pad
  const y0 = box.y - box.h / 2 - pad
  const y1 = box.y + box.h / 2 + pad
  return points.some((b, i) => {
    if (i === 0 || !shows(i) || !shows(i - 1)) return false
    const a = points[i - 1]
    // clip the segment to the box one edge at a time; anything left over is inside
    let lo = 0
    let hi = 1
    for (const [p, q] of [
      [a.x - b.x, a.x - x0],
      [b.x - a.x, x1 - a.x],
      [a.y - b.y, a.y - y0],
      [b.y - a.y, y1 - a.y],
    ]) {
      if (p === 0) {
        if (q < 0) return false
      } else if (p < 0) lo = Math.max(lo, q / p)
      else hi = Math.min(hi, q / p)
    }
    return lo <= hi
  })
}

export function declutterLabels(
  boxes: LabelBox[],
  bounds: { width: number; height: number },
  { gap = 4, margin = 4, iterations = 24 }: { gap?: number; margin?: number; iterations?: number } = {},
): { x: number; y: number }[] {
  const clamp = (v: number, half: number, size: number) =>
    half * 2 + margin * 2 > size ? size / 2 : Math.min(Math.max(v, margin + half), size - margin - half)
  const placed = boxes.map((b) =>
    b.w > 0 && b.h > 0 && !b.fixed
      ? { x: clamp(b.x, b.w / 2, bounds.width), y: clamp(b.y, b.h / 2, bounds.height) }
      : { x: b.x, y: b.y },
  )
  const live = boxes.flatMap((b, i) => (b.w > 0 && b.h > 0 ? [i] : []))
  const free = live.filter((i) => !boxes[i].fixed)
  const pins = live.filter((i) => boxes[i].fixed)
  const acrossX = (i: number, j: number) => Math.abs(placed[i].x - placed[j].x) < (boxes[i].w + boxes[j].w) / 2

  for (let pass = 0; pass < iterations; pass++) {
    let moved = false
    // a fixed box never gives way: a label in the way of one goes to the nearest
    // height that clears every fixed box it crosses
    for (const m of free) {
      const blocked = pins
        .filter((f) => acrossX(m, f))
        .map((f) => {
          const reach = (boxes[f].h + boxes[m].h) / 2 + gap
          return [placed[f].y - reach, placed[f].y + reach]
        })
      const inside = (y: number) => blocked.some(([lo, hi]) => y > lo + 1e-6 && y < hi - 1e-6)
      if (!inside(placed[m].y)) continue
      const options = blocked
        .flat()
        .map((y) => clamp(y, boxes[m].h / 2, bounds.height))
        .filter((y) => !inside(y))
      if (!options.length) continue
      const from = placed[m].y
      placed[m].y = options.reduce((a, b) => (Math.abs(b - from) < Math.abs(a - from) ? b : a))
      moved = true
    }
    for (let p = 0; p < free.length; p++) {
      for (let q = p + 1; q < free.length; q++) {
        const i = free[p]
        const j = free[q]
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
