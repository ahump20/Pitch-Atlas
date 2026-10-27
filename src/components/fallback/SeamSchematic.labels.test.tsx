import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PITCHES } from '../../data/pitches'
import { SeamSchematic } from './SeamSchematic'

const filed = PITCHES.filter(
  (p) => p.canonical.gripModel.status === 'filed' && p.canonical.gripModel.contacts.length > 0,
)

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
