import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { SeamSchematic } from './SeamSchematic'

const filed = PITCHES.filter(
  (p) => p.canonical.gripModel.status === 'filed' && p.canonical.gripModel.contacts.length > 0,
)

const num = (el: Element, name: string) => Number(el.getAttribute(name))

// the finger as drawn: its spine polyline and stroke
function fingerLine(container: HTMLElement, label: string) {
  const path = container.querySelector(`path[data-grip-finger="${CSS.escape(label)}"]`)!
  const points = [...path.getAttribute('d')!.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
  return { points, width: num(path, 'stroke-width') }
}

function distanceToLine(p: { x: number; y: number }, line: { x: number; y: number }[]) {
  let best = Infinity
  for (let k = 1; k < line.length; k++) {
    const [a, b] = [line[k - 1], line[k]]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
    best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)))
  }
  return best
}

function plates(container: HTMLElement) {
  return [...container.querySelectorAll('[data-grip-label] rect')].map((r) => ({
    x: Number(r.getAttribute('x')),
    y: Number(r.getAttribute('y')),
    w: Number(r.getAttribute('width')),
    h: Number(r.getAttribute('height')),
  }))
}

describe('schematic finger labels', () => {
  it('sit on plates that stay inside the drawing and never touch, in every view and hand', () => {
    expect(filed.length).toBeGreaterThan(0)
    for (const p of filed) {
      const contacts = p.canonical.gripModel.contacts
      let named = 0
      for (const view of ['top', 'side', 'thumb'] as const) {
        for (const handedness of ['right', 'left'] as const) {
          const { container, unmount } = render(
            <SeamSchematic grip={contacts} referenceContacts={contacts} view={view} handedness={handedness} surface="stage" />,
          )
          const boxes = plates(container)
          const where = `${p.display.slug} ${view} ${handedness}`
          named += boxes.length
          expect(boxes.length, where).toBe(container.querySelectorAll('[data-grip-label]').length)
          for (const b of boxes) {
            expect(b.x, where).toBeGreaterThanOrEqual(0)
            expect(b.y, where).toBeGreaterThanOrEqual(0)
            expect(b.x + b.w, where).toBeLessThanOrEqual(240)
            expect(b.y + b.h, where).toBeLessThanOrEqual(240)
          }
          for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
              const [a, b] = [boxes[i], boxes[j]]
              const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y
              expect(apart, `${where}: ${i} vs ${j}`).toBe(true)
            }
          }
          unmount()
        }
      }
      expect(named, p.display.slug).toBeGreaterThan(0)
    }
  })

  it('pins every name to its own fingertip: the dot sits on the finger, no plate covers a dot, and a moved plate is tied back by a hairline', () => {
    for (const p of filed) {
      const contacts = p.canonical.gripModel.contacts
      for (const view of ['top', 'side', 'thumb'] as const) {
        for (const handedness of ['right', 'left'] as const) {
          const { container, unmount } = render(
            <SeamSchematic grip={contacts} referenceContacts={contacts} view={view} handedness={handedness} surface="stage" />,
          )
          const groups = [...container.querySelectorAll('[data-grip-label]')]
          const dots = groups.map((g) => g.querySelector('circle[data-grip-anchor]'))
          for (const [k, g] of groups.entries()) {
            const label = g.getAttribute('data-grip-label')!
            const where = `${p.display.slug} ${view} ${handedness} ${label}`
            const dot = dots[k]
            expect(dot, where).not.toBeNull()
            const c = { x: num(dot!, 'cx'), y: num(dot!, 'cy') }
            const finger = fingerLine(container, label)
            expect(distanceToLine(c, finger.points), where).toBeLessThanOrEqual(finger.width / 2 + 0.5)

            const rect = g.querySelector('rect')!
            const box = { x: num(rect, 'x'), y: num(rect, 'y'), w: num(rect, 'width'), h: num(rect, 'height') }
            for (const other of dots) {
              const r = num(other!, 'r')
              const o = { x: num(other!, 'cx'), y: num(other!, 'cy') }
              const clear = o.x + r <= box.x || o.x - r >= box.x + box.w || o.y + r <= box.y || o.y - r >= box.y + box.h
              expect(clear, `${where}: its plate covers the ${other!.parentElement!.getAttribute('data-grip-label')} dot`).toBe(true)
            }

            const tether = g.querySelector('line[data-grip-tether]')
            const mid = box.y + box.h / 2
            // the hairline leaves the plate from the edge nearest the dot
            const near =
              c.x <= box.x
                ? { x: box.x, y: mid }
                : c.x >= box.x + box.w
                  ? { x: box.x + box.w, y: mid }
                  : { x: c.x, y: c.y < box.y ? box.y : box.y + box.h }
            if (tether) {
              expect(num(tether, 'x1'), where).toBeCloseTo(c.x)
              expect(num(tether, 'y1'), where).toBeCloseTo(c.y)
              expect(num(tether, 'x2'), where).toBeCloseTo(near.x)
              expect(num(tether, 'y2'), where).toBeCloseTo(near.y)
            } else {
              // unmoved (a nudge under a quarter unit draws no line): level with its dot, a hair away
              expect(Math.abs(mid - c.y), where).toBeLessThanOrEqual(0.25)
              expect(Math.abs(near.x - c.x), where).toBeLessThan(6)
            }
          }
          unmount()
        }
      }
    }
  })

  it('never lays a name across another finger when the other side of its fingertip is clear', () => {
    type Box = { x: number; y: number; w: number; h: number }
    // a finger as drawn: its stroke, only where it shows inside the ball's rim
    const across = (line: ReturnType<typeof fingerLine>, b: Box, rim: { x: number; y: number; r: number }) =>
      line.points.some((q, k) => {
        if (k === 0) return false
        const p = line.points[k - 1]
        for (let t = 0; t <= 1; t += 0.05) {
          const x = p.x + (q.x - p.x) * t
          const y = p.y + (q.y - p.y) * t
          const pad = line.width / 2
          if (Math.hypot(x - rim.x, y - rim.y) <= rim.r && x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad)
            return true
        }
        return false
      })
    const crossing: string[] = []
    for (const p of filed) {
      const contacts = p.canonical.gripModel.contacts
      for (const view of ['top', 'side', 'thumb'] as const) {
        for (const handedness of ['right', 'left'] as const) {
          const { container, unmount } = render(
            <SeamSchematic grip={contacts} referenceContacts={contacts} view={view} handedness={handedness} surface="stage" />,
          )
          const clip = container.querySelector('clipPath circle')!
          const rim = { x: num(clip, 'cx'), y: num(clip, 'cy'), r: num(clip, 'r') }
          const groups = [...container.querySelectorAll('[data-grip-label]')]
          const names = groups.map((g) => g.getAttribute('data-grip-label')!)
          const dots = groups.map((g) => g.querySelector('circle[data-grip-anchor]')!)
          const overOther = (b: Box, own: string) => names.some((n) => n !== own && across(fingerLine(container, n), b, rim))
          for (const [k, g] of groups.entries()) {
            const rect = g.querySelector('rect')!
            const box = { x: num(rect, 'x'), y: num(rect, 'y'), w: num(rect, 'width'), h: num(rect, 'height') }
            const dot = { x: num(dots[k], 'cx'), y: num(dots[k], 'cy') }
            if (!overOther(box, names[k]) || (dot.x > box.x && dot.x < box.x + box.w)) continue
            // the same plate on the other side of its dot, level with it
            const right = box.x >= dot.x
            const gap = right ? box.x - dot.x : dot.x - box.x - box.w
            const mirror = { x: right ? dot.x - gap - box.w : dot.x + gap, y: dot.y - box.h / 2, w: box.w, h: box.h }
            const roomy = mirror.x >= 0 && mirror.x + mirror.w <= 240
            if (roomy && !overOther(mirror, names[k])) crossing.push(`${p.display.slug} ${view} ${handedness}: ${names[k]}`)
          }
          unmount()
        }
      }
    }
    expect(crossing).toEqual([])
  })

  it('leaves the tiny card-back drawing without names or pins', () => {
    const slider = PITCHES.find((p) => p.display.slug === 'slider')!
    const contacts = slider.canonical.gripModel.contacts
    const { container } = render(<SeamSchematic grip={contacts} referenceContacts={contacts} showLabels={false} />)
    expect(container.querySelector('[data-grip-label]')).toBeNull()
    expect(container.querySelector('[data-grip-anchor]')).toBeNull()
  })

  it("keeps a name that only just misses room past its fingertip on that side, instead of laying it across the next finger", () => {
    const cutter = PITCHES.find((p) => p.display.slug === 'cutter')!
    const contacts = cutter.canonical.gripModel.contacts
    const { container } = render(
      <SeamSchematic grip={contacts} referenceContacts={contacts} view="top" surface="stage" />,
    )
    const middle = [...container.querySelectorAll('[data-grip-label]')].find((g) => g.textContent === 'MIDDLE PRESSURE')!
    const rect = middle.querySelector('rect')!
    const dot = middle.querySelector('circle[data-grip-anchor]')!
    // the middle fingertip points left, toward the edge, so its name runs left of the dot
    expect(num(rect, 'x') + num(rect, 'width')).toBeLessThanOrEqual(num(dot, 'cx'))
  })

  it('names the cutter fingers on plates in the top view', () => {
    const cutter = PITCHES.find((p) => p.display.slug === 'cutter')!
    const contacts = cutter.canonical.gripModel.contacts
    const { container } = render(
      <SeamSchematic grip={contacts} referenceContacts={contacts} view="top" surface="stage" />,
    )
    const names = [...container.querySelectorAll('[data-grip-label] text')].map((t) => t.textContent)
    expect(names).toEqual(expect.arrayContaining(['MIDDLE PRESSURE', 'INDEX OFF-CENTER']))
  })
})
