import { describe, it, expect } from 'vitest'
import { magnusDirection, ivbSign, activeSpinSplit, BACKSPIN_AXIS, PITCH_VELOCITY } from './physics'

describe('physics helpers', () => {
  it('backspin produces an upward Magnus force', () => {
    const dir = magnusDirection(BACKSPIN_AXIS, PITCH_VELOCITY)
    expect(dir.z).toBeGreaterThan(0.99)
  })

  it('a four-seam rides (induced vertical break is positive)', () => {
    expect(ivbSign(BACKSPIN_AXIS, PITCH_VELOCITY)).toBe(1)
  })

  it('topspin drops more (negative induced vertical break)', () => {
    const topspin = { x: 1, y: 0, z: 0 } // opposite of backspin
    expect(ivbSign(topspin, PITCH_VELOCITY)).toBe(-1)
  })

  it('splits spin into active and gyro shares', () => {
    const split = activeSpinSplit(2530, 97.1)
    expect(split.activeRpm).toBeCloseTo(2456.63, 1)
    expect(split.gyroRpm).toBeCloseTo(73.37, 1)
    expect(split.activeRpm + split.gyroRpm).toBeCloseTo(2530, 6)
  })

  it('clamps efficiency to a sane range', () => {
    expect(activeSpinSplit(2000, 130).activeRpm).toBe(2000)
    expect(activeSpinSplit(2000, -5).activeRpm).toBe(0)
  })
})
