import { orientedSeamPolyline } from './seam'

/*
  Orthographic projection of the seam to 2D screen space. The single place the
  seam becomes a drawing, shared by the schematic and the carry diagram so every
  2D seam on the page is the same curve.
*/

interface P2 {
  x: number
  y: number
  z: number // depth retained for front/back sorting
}

/** Project the oriented seam onto a circle of radius r centered at (cx, cy). */
export function projectSeam(cx: number, cy: number, r: number, segments = 280): P2[] {
  return orientedSeamPolyline(segments, 1).map((p) => ({
    x: cx + p.x * r,
    y: cy - p.y * r, // screen y grows downward
    z: p.z,
  }))
}

export function pathOf(run: P2[]): string {
  // One decimal is sub-pixel at every render size the seam draws at, and this path
  // string is inlined into ~100 SVGs on every prerendered page — the extra decimal
  // is pure payload. Trimming to toFixed(1) is the safe precision win (the seam
  // geometry itself, compared point-for-point elsewhere, is untouched).
  return run
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

/** Split the projected seam into front (toward viewer) and back runs for depth. */
export function splitRuns(points: P2[]): { front: boolean; d: string }[] {
  const runs: { front: boolean; d: string }[] = []
  let cur: P2[] = []
  let curFront: boolean | null = null
  for (const p of points) {
    const f = p.z >= 0
    if (curFront === null) {
      curFront = f
      cur = [p]
    } else if (f === curFront) {
      cur.push(p)
    } else {
      cur.push(p)
      runs.push({ front: curFront, d: pathOf(cur) })
      curFront = f
      cur = [p]
    }
  }
  if (cur.length > 1) runs.push({ front: curFront ?? true, d: pathOf(cur) })
  return runs
}

export interface Stitch {
  x1: number
  y1: number
  x2: number
  y2: number
  front: boolean
}

/** Short ticks perpendicular to the seam, evoking stitches. Schematic, not 108. */
export function buildStitches(points: P2[], every = 5, len = 6): Stitch[] {
  const out: Stitch[] = []
  for (let i = 0; i < points.length - 1; i += every) {
    const a = points[i]
    const b = points[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const L = Math.hypot(dx, dy) || 1
    const nx = -dy / L
    const ny = dx / L
    out.push({
      x1: a.x - (nx * len) / 2,
      y1: a.y - (ny * len) / 2,
      x2: a.x + (nx * len) / 2,
      y2: a.y + (ny * len) / 2,
      front: a.z >= 0,
    })
  }
  return out
}
