import { describe, it, expect } from 'vitest'
import { asOfDate } from './format'

describe('asOfDate', () => {
  it('formats an ISO date without timezone drift', () => {
    expect(asOfDate('2026-06-04')).toBe('June 4, 2026')
    expect(asOfDate('2026-01-01')).toBe('January 1, 2026')
    expect(asOfDate('2025-12-31')).toBe('December 31, 2025')
  })

  it('returns the input unchanged when it is not a plain ISO date', () => {
    expect(asOfDate('not-a-date')).toBe('not-a-date')
    expect(asOfDate('2026-13-01')).toBe('2026-13-01')
  })
})
