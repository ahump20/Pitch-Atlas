import { describe, expect, it } from 'vitest'
import * as adapter from '../island-learning'
import { PITCHES, pitchBySlug } from '../data/pitches'
import { normalizeSelection } from '../components/compare/selection'
import { projectSeam } from '../lib/seam2d'
import { seamPoint } from '../lib/seam'

describe('island learning adapter', () => {
  it('exports the canonical pitch objects without copying the registry', () => {
    expect(adapter.PITCHES).toBe(PITCHES)
    expect(adapter.pitchBySlug('four-seam')).toBe(pitchBySlug('four-seam'))
  })

  it('preserves canonical comparison normalization', () => {
    const input = { a: 'four-seam', b: 'four-seam', view: 'invalid', hand: 'invalid', orientation: 'invalid' }
    expect(adapter.normalizeSelection(input as never)).toEqual(normalizeSelection(input as never))
    expect(adapter.normalizeSelection(input as never)).toEqual({
      a: 'four-seam', b: null, view: 'grips', hand: 'right', orientation: 'top',
    })
    expect(adapter.normalizeSelection({ a: 'not-a-pitch', b: 'slider' })).toMatchObject({ a: null, b: 'slider' })
  })

  it('uses the canonical seam and projection implementations', () => {
    expect(adapter.seamPoint(Math.PI / 3, 2)).toEqual(seamPoint(Math.PI / 3, 2))
    expect(adapter.projectSeam(40, 50, 30, 12)).toEqual(projectSeam(40, 50, 30, 12))
  })
})
