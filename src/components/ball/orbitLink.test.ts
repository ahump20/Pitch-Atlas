import { describe, expect, it, vi } from 'vitest'
import { createOrbitLink } from './orbitLink'

describe('the orbit link', () => {
  it('turns the other stage with the one being dragged', () => {
    const link = createOrbitLink()
    const a = vi.fn()
    const b = vi.fn()
    link.subscribe('a', a)
    link.subscribe('b', b)
    link.drive('a')
    link.publish('a', { azimuth: 0.4, polar: 1.2 })
    expect(b).toHaveBeenCalledWith({ azimuth: 0.4, polar: 1.2 })
    expect(a).not.toHaveBeenCalled()
  })

  it('never echoes: the stage that was moved for the reader does not publish back', () => {
    const link = createOrbitLink()
    const a = vi.fn()
    link.subscribe('a', a)
    link.subscribe('b', vi.fn())
    link.drive('a')
    // b moves because a moved; its own change event must not travel back to a
    link.publish('b', { azimuth: 0.4, polar: 1.2 })
    expect(a).not.toHaveBeenCalled()
  })

  it('holds each stage on its own once unlinked', () => {
    const link = createOrbitLink()
    const b = vi.fn()
    link.subscribe('b', b)
    link.setLinked(false)
    link.drive('a')
    link.publish('a', { azimuth: 1, polar: 1 })
    expect(b).not.toHaveBeenCalled()
    expect(link.linked).toBe(false)
  })

  it('linking again brings the other stage to the angle last turned', () => {
    const link = createOrbitLink()
    const b = vi.fn()
    link.subscribe('a', vi.fn())
    link.subscribe('b', b)
    link.setLinked(false)
    link.drive('a')
    link.publish('a', { azimuth: 2, polar: 1 })
    expect(b).not.toHaveBeenCalled()
    link.setLinked(true)
    expect(b).toHaveBeenCalledWith({ azimuth: 2, polar: 1 })
  })

  it('a stage that joins a linked bench starts at the angle already turned', () => {
    const link = createOrbitLink()
    link.subscribe('a', vi.fn())
    link.drive('a')
    link.publish('a', { azimuth: 0.7, polar: 1.1 })
    const b = vi.fn()
    link.subscribe('b', b)
    expect(b).toHaveBeenCalledWith({ azimuth: 0.7, polar: 1.1 })
  })

  it('a stage that joins unlinked, or after Reset, keeps its own angle', () => {
    const unlinked = createOrbitLink()
    unlinked.drive('a')
    unlinked.publish('a', { azimuth: 0.7, polar: 1.1 })
    unlinked.setLinked(false)
    const b = vi.fn()
    unlinked.subscribe('b', b)
    expect(b).not.toHaveBeenCalled()

    const reset = createOrbitLink()
    reset.drive('a')
    reset.publish('a', { azimuth: 0.7, polar: 1.1 })
    reset.reset()
    const c = vi.fn()
    reset.subscribe('b', c)
    expect(c).not.toHaveBeenCalled()
  })

  it('resets every stage, linked or not, and forgets a stage that left', () => {
    const link = createOrbitLink()
    const one = vi.fn()
    const two = vi.fn()
    link.onReset(one)
    const off = link.onReset(two)
    link.setLinked(false)
    off()
    link.reset()
    expect(one).toHaveBeenCalledTimes(1)
    expect(two).not.toHaveBeenCalled()
  })
})
