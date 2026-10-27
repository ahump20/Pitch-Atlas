import { describe, expect, it } from 'vitest'
import { declutterLabels, lineNearBox, plateSide, type LabelBox } from './labelLayout'

const bounds = { width: 300, height: 300 }

function overlaps(a: LabelBox, b: LabelBox, gap: number) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap - 1e-6
}

describe('declutterLabels', () => {
  it('leaves labels that already sit apart and inside the frame where they are', () => {
    const boxes = [
      { x: 80, y: 60, w: 100, h: 20 },
      { x: 200, y: 200, w: 100, h: 20 },
    ]
    expect(declutterLabels(boxes, bounds)).toEqual([
      { x: 80, y: 60 },
      { x: 200, y: 200 },
    ])
  })

  it('splits two stacked labels evenly, first above second when they share a point', () => {
    const boxes = [
      { x: 150, y: 150, w: 120, h: 20 },
      { x: 150, y: 150, w: 120, h: 20 },
    ]
    const [a, b] = declutterLabels(boxes, bounds, { gap: 4 })
    expect(a.y).toBeLessThan(b.y)
    expect(b.y - a.y).toBeCloseTo(24)
    expect((a.y + b.y) / 2).toBeCloseTo(150)
  })

  it('separates a crowded cluster so no two labels touch', () => {
    const boxes = [
      { x: 140, y: 120, w: 130, h: 20 },
      { x: 150, y: 126, w: 150, h: 20 },
      { x: 160, y: 118, w: 90, h: 20 },
      { x: 60, y: 250, w: 70, h: 20 },
    ]
    const placed = declutterLabels(boxes, bounds, { gap: 4 }).map((p, i) => ({ ...boxes[i], ...p }))
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(overlaps(placed[i], placed[j], 4), `${i} vs ${j}`).toBe(false)
      }
    }
    expect(placed[3]).toMatchObject({ x: 60, y: 250 })
  })

  it('pulls a label that hangs off an edge back inside the frame', () => {
    const [p] = declutterLabels([{ x: 290, y: 4, w: 130, h: 20 }], bounds, { margin: 4 })
    expect(p.x).toBe(300 - 4 - 65)
    expect(p.y).toBe(4 + 10)
  })

  it('keeps pushed labels inside the frame at the bottom edge', () => {
    const boxes = [
      { x: 150, y: 290, w: 100, h: 20 },
      { x: 150, y: 292, w: 100, h: 20 },
    ]
    const placed = declutterLabels(boxes, bounds, { gap: 4, margin: 4 })
    for (const p of placed) expect(p.y).toBeLessThanOrEqual(300 - 4 - 10)
    expect(placed[1].y - placed[0].y).toBeGreaterThanOrEqual(24 - 1e-6)
  })

  it('centres a label wider than the frame and skips hidden ones', () => {
    const placed = declutterLabels(
      [
        { x: 10, y: 150, w: 400, h: 20 },
        { x: 150, y: 150, w: 0, h: 0 },
      ],
      bounds,
    )
    expect(placed[0].x).toBe(150)
    expect(placed[1]).toEqual({ x: 150, y: 150 })
  })

  it('never moves a fixed box: the label beside it takes the whole push', () => {
    const boxes = [
      { x: 150, y: 150, w: 10, h: 10, fixed: true },
      { x: 150, y: 152, w: 100, h: 20 },
    ]
    const [dot, plate] = declutterLabels(boxes, bounds, { gap: 4 })
    expect(dot).toEqual({ x: 150, y: 150 })
    expect(plate.y - dot.y).toBeCloseTo((10 + 20) / 2 + 4)
  })

  it('leaves fixed boxes alone, even touching each other or past the frame', () => {
    const boxes = [
      { x: 100, y: 100, w: 10, h: 10, fixed: true },
      { x: 102, y: 101, w: 10, h: 10, fixed: true },
      { x: 2, y: 299, w: 10, h: 10, fixed: true },
    ]
    expect(declutterLabels(boxes, bounds)).toEqual([
      { x: 100, y: 100 },
      { x: 102, y: 101 },
      { x: 2, y: 299 },
    ])
  })

  it('hops a label to the far side of a fixed box when the frame leaves no room on the near side', () => {
    const boxes = [
      { x: 150, y: 280, w: 10, h: 10, fixed: true },
      { x: 150, y: 284, w: 100, h: 20 },
    ]
    const [dot, plate] = declutterLabels(boxes, bounds, { gap: 4, margin: 4 })
    expect(plate.y).toBeLessThan(dot.y)
    expect(dot.y - plate.y).toBeCloseTo((10 + 20) / 2 + 4)
  })
})


describe('plateSide', () => {
  const box = { x: 100, y: 100, w: 40, h: 10 }
  it('sees a finger that runs straight through a plate, and not one the ball hides', () => {
    const finger = [{ x: 60, y: 80 }, { x: 140, y: 120 }]
    expect(lineNearBox(finger, box, 0)).toBe(true)
    expect(lineNearBox(finger, box, 0, (i) => i === 0)).toBe(false)
    expect(lineNearBox([{ x: 60, y: 80 }, { x: 140, y: 80 }], box, 2)).toBe(false)
    expect(lineNearBox([{ x: 60, y: 80 }, { x: 140, y: 80 }], box, 20)).toBe(true)
  })

  it('runs the way the finger points unless that lies across another finger and the other side is clear', () => {
    const room = () => -10
    expect(plateSide(1, room, 4, () => false)).toBe(1)
    expect(plateSide(1, room, 4, (side) => side === 1)).toBe(-1)
    expect(plateSide(1, room, 4, () => true)).toBe(1)
    // no room the other way: it stays on the finger it crosses
    expect(plateSide(1, (side) => (side === 1 ? -10 : 30), 4, (side) => side === 1)).toBe(1)
  })
})
