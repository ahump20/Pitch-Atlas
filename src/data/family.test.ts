import { describe, expect, it } from 'vitest'
import { PITCHES, pitchBySlug } from './pitches'
import { familyLabel, familyOverline } from './family'

describe('the family, named once', () => {
  it('names each family the way the Pitch Index filters it', () => {
    expect(familyLabel('fastball')).toBe('Fastball')
    expect(familyLabel('breaking')).toBe('Breaking')
    expect(familyLabel('offspeed')).toBe('Offspeed')
  })

  it('puts the family over a name only when the name does not already say it', () => {
    // "Fastball" over "Four-seam fastball" said fastball twice
    expect(familyOverline(pitchBySlug('four-seam')!)).toBeNull()
    expect(familyOverline(pitchBySlug('slider')!)).toBe('Breaking')
    for (const entry of PITCHES) {
      const said = entry.canonical.name.toLowerCase().includes(familyLabel(entry.canonical.family).toLowerCase())
      expect(familyOverline(entry), entry.display.slug).toBe(said ? null : familyLabel(entry.canonical.family))
    }
  })
})
