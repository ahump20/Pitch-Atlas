import { describe, expect, it } from 'vitest'
import { ACCENT, BURNT, FALLBACK_ACCENT, accentButton, contrast } from './accents'

describe('accentButton', () => {
  it('keeps every accent-filled action at 4.5:1 or better', () => {
    for (const fill of [...Object.values(ACCENT).map((a) => a.c3), FALLBACK_ACCENT.c3, BURNT]) {
      const { background, color } = accentButton(fill)
      expect(contrast(color, background), `${fill} -> ${color} on ${background}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('leaves a passing accent untouched and keeps burnt orange on white ink', () => {
    expect(accentButton('#B9D4E5')).toEqual({ background: '#B9D4E5', color: '#06121B' })
    expect(accentButton(BURNT)).toEqual({ background: BURNT, color: '#FFFFFF' })
  })

  it('lifts a dim accent only as far as the dark ink needs', () => {
    const { background, color } = accentButton('#5B7F96') // forkball slate: neither ink passes as is
    expect(color).toBe('#06121B')
    expect(background).not.toBe('#5B7F96')
    expect(contrast(color, background)).toBeGreaterThanOrEqual(4.5)
  })
})
