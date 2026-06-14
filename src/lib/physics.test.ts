import { describe, it, expect } from 'vitest'
import { magnusDirection, ivbSign, BACKSPIN_AXIS, PITCH_VELOCITY } from './physics'

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

})
