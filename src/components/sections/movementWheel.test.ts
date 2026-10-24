import { describe, expect, it } from 'vitest'
import { pitchBySlug } from '../../data/pitches'
import { movementWheel, WHEEL_CENTER, WHEEL_RADIUS } from './movementWheel'

/*
  One geometry for the movement wheel, read by the SVG on the page back and by the
  export's canvas back, so the two can never draw different wheels. Direction only:
  the arrow has one fixed length whatever the pitch.
*/

function motionOf(slug: string) {
  const entry = pitchBySlug(slug)
  if (!entry?.motion) throw new Error(`${slug} has a motion record`)
  return entry.motion
}

describe('movementWheel', () => {
  it('points a four-seam straight up, at the fixed length', () => {
    const w = movementWheel(motionOf('four-seam'))
    expect(w.filed).toBe(true)
    expect(w.label).toBe('Rides')
    expect(w.note).toMatch(/direction only$/)
    expect(w.rings).toEqual([WHEEL_RADIUS, WHEEL_RADIUS * 0.62, WHEEL_RADIUS * 0.28])
    expect(w.ticks).toHaveLength(4)
    expect(w.axis).not.toBeNull()
    const { shaft } = w.arrow!
    expect(shaft.x2).toBeCloseTo(WHEEL_CENTER, 9)
    expect(shaft.y2).toBeLessThan(WHEEL_CENTER)
    expect(Math.hypot(shaft.x2 - shaft.x1, shaft.y2 - shaft.y1)).toBeCloseTo(WHEEL_RADIUS * 0.64, 6)
    expect(w.centerDot).toBe(4)
    expect(w.scatter).toEqual([])
    expect(w.gyro).toBe(false)
  })

  it('points a cutter up and to the glove side, at the same length', () => {
    const w = movementWheel(motionOf('cutter'))
    expect(w.label).toBe('Rides · glove-side')
    const { shaft } = w.arrow!
    expect(shaft.x2).toBeLessThan(WHEEL_CENTER)
    expect(shaft.y2).toBeLessThan(WHEEL_CENTER)
    expect(Math.hypot(shaft.x2 - shaft.x1, shaft.y2 - shaft.y1)).toBeCloseTo(WHEEL_RADIUS * 0.64, 6)
  })

  it('scatters the knuckleball instead of pointing it', () => {
    const w = movementWheel(motionOf('knuckleball'))
    expect(w.label).toBe('No fixed shape')
    expect(w.arrow).toBeNull()
    expect(w.scatter).toHaveLength(6)
    expect(w.centerDot).toBeNull()
  })

  it('marks a gyro slider with the dot toward the viewer', () => {
    expect(movementWheel(motionOf('slider')).gyro).toBe(true)
  })

  it('draws the empty wheel, and says so, where no motion is filed', () => {
    const w = movementWheel(undefined)
    expect(w.filed).toBe(false)
    expect(w.label).toBe('Motion not filed')
    expect(w.note).toBe('source gap · no estimate')
    expect(w.flatLine).not.toBeNull()
    expect(w.arrow).toBeNull()
    expect(w.axis).toBeNull()
    expect(w.ariaLabel).toMatch(/not filed/)
  })
})
