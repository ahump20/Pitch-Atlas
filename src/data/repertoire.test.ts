import { describe, expect, it } from 'vitest'
import { REPERTOIRE } from './repertoire'
import { AUSTIN_GRIPS, gripEntryFor, gripPhotosFor } from './grips'

function entry(id: string) {
  const found = REPERTOIRE.find((pitch) => pitch.id === id)
  if (!found) throw new Error(`Missing repertoire entry: ${id}`)
  return found
}

describe('repertoire grip cues', () => {
  it('keeps the changeup family visual tells separate', () => {
    expect(entry('straight-three-finger-changeup').plain).toContain('three close fingers')
    expect(entry('circle-changeup').plain).toContain('visible thumb-index circle')
    expect(entry('football-changeup').plain).toContain('all four fingers on the ball')
    expect(entry('split-finger-fastball').grip.value).toContain('outside the laces')
  })
})

/*
  Anti-regression guard. Austin's own pitches are filed in HIS terms — his names,
  his families, his words — and must never be remapped onto the generic league
  taxonomy again. A prior pass repeatedly relabeled his football changeup as a
  "palmball" and his split-finger fastball as an offspeed "splitter," pulling his
  grip photos onto those encyclopedia entries. This locks the durable contract so
  the build fails the next time anyone re-introduces that mapping.
*/
describe("Austin's pitches stay in his terms (never remapped to league taxonomy)", () => {
  it('files the split-finger fastball as a FASTBALL, never an offspeed "splitter"', () => {
    const sf = entry('split-finger-fastball')
    expect(sf.name).toBe('Split-Finger Fastball')
    expect(sf.family).toBe('fastball')

    const grip = gripEntryFor('split-finger')
    expect(grip).toBeDefined()
    expect(grip?.label).toMatch(/split-finger fastball/i)
    expect(grip?.family).toBe('fastball')
    // his grip routes to his own entry, not the generic splitter specimen
    expect(grip?.repertoireId).toBe('split-finger-fastball')
    expect(grip?.specimenSlug).toBeUndefined()
  })

  it('files the football changeup as Austin\'s pitch, never a "palmball"', () => {
    const fc = entry('football-changeup')
    expect(fc.name).toBe('Football Changeup')
    expect(fc.family).toBe('offspeed')

    const grip = gripEntryFor('football-change')
    expect(grip).toBeDefined()
    expect(grip?.label).toBe('Football changeup')
    expect(grip?.label).not.toMatch(/palm/i)
    expect(grip?.repertoireId).toBe('football-changeup')
  })

  it("keeps the generic Splitter and Palmball entries from wearing Austin's hand", () => {
    // the league-taxonomy entries exist, but no first-party grip photo hangs on them
    expect(gripPhotosFor('splitter')).toHaveLength(0)
    expect(gripPhotosFor('palmball')).toHaveLength(0)
    // and the generic Palmball no longer claims to be a football change
    const palmball = entry('palmball')
    expect(palmball.aka).not.toContain('football change')
    expect(palmball.aka).not.toContain('football changeup')
    expect(palmball.plain).toBeDefined()
    expect(palmball.plain?.toLowerCase()).not.toContain('football')
  })

  it('asset filenames match the pitch name, not the league label', () => {
    // the photos his own files are named for — football-change-*, split-finger-*
    const fc = gripEntryFor('football-change')
    expect(fc?.photos.every((p) => p.src.includes('football-change'))).toBe(true)
    const sf = gripEntryFor('split-finger')
    expect(sf?.photos.every((p) => p.src.includes('split-finger'))).toBe(true)
    // no Austin grip entry still points at a palmball-*/splitter-* asset
    const stale = AUSTIN_GRIPS.flatMap((g) => g.photos).filter((p) =>
      /\/(palmball|splitter)-/.test(p.src),
    )
    expect(stale).toHaveLength(0)
  })
})
