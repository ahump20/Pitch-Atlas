import { describe, it, expect } from 'vitest'
import { buildBreak, tiltClock, describeShape } from './sandbox'

describe('build-the-break model', () => {
  it('pure backspin (12:00) rides with no horizontal break', () => {
    const r = buildBreak({ tiltDeg: 0, rpm: 2300, effPct: 100, veloMph: 94 })
    expect(r.ivbInches).toBeGreaterThan(10)
    expect(r.horizontalInches).toBe(0)
    expect(r.horizontalDir).toBe('none')
  })

  it('pure topspin (6:00) drops below the spinless ball', () => {
    const r = buildBreak({ tiltDeg: 180, rpm: 2300, effPct: 100, veloMph: 80 })
    expect(r.ivbInches).toBeLessThan(0)
    expect(r.horizontalInches).toBe(0)
  })

  it('side tilt (3:00) is all horizontal, no vertical', () => {
    const r = buildBreak({ tiltDeg: 90, rpm: 2400, effPct: 100, veloMph: 84 })
    expect(Math.abs(r.ivbInches)).toBeLessThanOrEqual(1)
    expect(r.horizontalInches).toBeGreaterThan(5)
    expect(r.horizontalDir).toBe('arm-side')
  })

  it('the opposite side tilt (9:00) breaks to the glove side', () => {
    const r = buildBreak({ tiltDeg: 270, rpm: 2400, effPct: 100, veloMph: 84 })
    expect(r.horizontalDir).toBe('glove-side')
  })

  it('low efficiency is gyro-dominant: mostly bullet spin, the axis points at the catcher', () => {
    const r = buildBreak({ tiltDeg: 90, rpm: 2600, effPct: 20, veloMph: 86 })
    expect(r.gyro).toBe(true)
    expect(r.gyroRpm).toBeGreaterThan(r.activeRpm)
    expect(r.spinAxis.z).toBeGreaterThan(0.5)
  })

  it('the four-seam anchor lands near its real +16 in IVB', () => {
    const r = buildBreak({ tiltDeg: 0, rpm: 2300, effPct: 90, veloMph: 94 })
    expect(r.ivbInches).toBeGreaterThanOrEqual(14)
    expect(r.ivbInches).toBeLessThanOrEqual(18)
  })

  it('more active spin makes more break', () => {
    const low = buildBreak({ tiltDeg: 0, rpm: 1800, effPct: 90, veloMph: 94 })
    const high = buildBreak({ tiltDeg: 0, rpm: 2700, effPct: 90, veloMph: 94 })
    expect(high.ivbInches).toBeGreaterThan(low.ivbInches)
  })

  it('formats a tilt in degrees as a clock', () => {
    expect(tiltClock(0)).toBe('12:00')
    expect(tiltClock(90)).toBe('3:00')
    expect(tiltClock(180)).toBe('6:00')
    expect(tiltClock(270)).toBe('9:00')
    expect(tiltClock(45)).toBe('1:30')
  })

  it('describes a gyro pitch by its bullet spin, not its lift', () => {
    const r = buildBreak({ tiltDeg: 60, rpm: 2500, effPct: 22, veloMph: 87 })
    expect(describeShape(r).toLowerCase()).toContain('bullet spin')
  })
})
