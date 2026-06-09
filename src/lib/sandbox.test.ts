import { describe, it, expect } from 'vitest'
import { buildBreak, describeShape, tiltClock } from './sandbox'

describe('shape lab model', () => {
  it('pure backspin reads as ride with no side shape', () => {
    const r = buildBreak({ tiltDeg: 0 })
    expect(r.verticalShape).toBe('ride')
    expect(r.horizontalDir).toBe('none')
    expect(describeShape(r).toLowerCase()).toContain('ride')
  })

  it('pure topspin reads as drop', () => {
    const r = buildBreak({ tiltDeg: 180 })
    expect(r.verticalShape).toBe('drop')
    expect(r.horizontalDir).toBe('none')
  })

  it('side tilt maps to side shape without magnitude', () => {
    expect(buildBreak({ tiltDeg: 90 }).horizontalDir).toBe('arm-side')
    expect(buildBreak({ tiltDeg: 270 }).horizontalDir).toBe('glove-side')
  })

  it('blended tilt reads as a blended shape', () => {
    const r = buildBreak({ tiltDeg: 45 })
    expect(r.verticalShape).toBe('ride')
    expect(r.horizontalDir).toBe('arm-side')
    expect(r.shapeNote).toContain('Blended shape')
  })

  it('formats a tilt in degrees as a clock', () => {
    expect(tiltClock(0)).toBe('12:00')
    expect(tiltClock(90)).toBe('3:00')
    expect(tiltClock(180)).toBe('6:00')
    expect(tiltClock(270)).toBe('9:00')
    expect(tiltClock(45)).toBe('1:30')
  })
})
