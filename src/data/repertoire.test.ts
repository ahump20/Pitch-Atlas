import { describe, expect, it } from 'vitest'
import { BASIC_REPERTOIRE, REPERTOIRE } from './repertoire'
import { PITCHES, pitchBySlug } from './pitches'
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

/*
  Feature #11 — basic-file study hooks. A basic file is the page an unfiled pitch
  lands on; the study hook is the one bridge it gets to a filed specimen that
  teaches its mechanic. These guards keep the hook honest: it must resolve to a
  real filed pitch (never a typo or a basic id), every context note is a real
  sourced claim, and the banned doctored pitches stay hook-free because none has a
  legal pitch to "study first."
*/
describe('basic-file study hooks', () => {
  const FILED = new Set(PITCHES.map((p) => p.display.slug))

  it('points every study hook at a real filed specimen, never a basic id or a typo', () => {
    for (const e of BASIC_REPERTOIRE) {
      if (!e.studyFirstSlug) continue
      expect(FILED.has(e.studyFirstSlug), `${e.id} -> ${e.studyFirstSlug}`).toBe(true)
      expect(pitchBySlug(e.studyFirstSlug)).toBeDefined()
    }
  })

  it('gives every non-banned basic file a study hook so none silently dead-ends', () => {
    const orphans = BASIC_REPERTOIRE.filter(
      (e) => e.family !== 'banned' && !e.studyFirstSlug,
    ).map((e) => e.id)
    expect(orphans).toEqual([])
  })

  it('keeps the banned doctored pitches hook-free — no legal pitch to study first', () => {
    const banned = BASIC_REPERTOIRE.filter((e) => e.family === 'banned')
    expect(banned.length).toBeGreaterThan(0)
    expect(banned.every((e) => e.studyFirstSlug === undefined)).toBe(true)
    expect(banned.every((e) => e.contextNote === undefined)).toBe(true)
  })

  it('makes every context note a real sourced claim with clean visible copy', () => {
    for (const e of BASIC_REPERTOIRE) {
      if (!e.contextNote) continue
      const c = e.contextNote
      expect(c.value.length, `${e.id} note empty`).toBeGreaterThan(0)
      const weak = c.confidence === 'unverified' || c.confidence === 'secondhand-attributed'
      // a confident note carries a source; a weak one must carry its explanatory note
      if (weak) expect(c.note && c.note.length > 0, `${e.id} weak note needs a note`).toBe(true)
      else expect(c.source, `${e.id} note needs a source`).toBeDefined()
      // no em/en dash leaks into the study copy I authored (Austin's own ledes are exempt)
      expect(c.value, `${e.id} note has a long dash`).not.toMatch(/[—–]/)
    }
  })

  it("keeps Austin's pitch hooks in his terms and the screwball bridge honest", () => {
    const sf = BASIC_REPERTOIRE.find((e) => e.id === 'split-finger-fastball')!
    expect(sf.studyFirstSlug).toBe('splitter')
    expect(sf.contextNote?.confidence).toBe('pitcher-own-words')

    const fc = BASIC_REPERTOIRE.find((e) => e.id === 'football-changeup')!
    expect(fc.contextNote?.confidence).toBe('pitcher-own-words')
    expect(fc.contextNote?.value.toLowerCase()).toContain('not a palmball')

    // the circle change is the sourced modern stand-in for the screwball's arm-side fade
    const screw = BASIC_REPERTOIRE.find((e) => e.id === 'screwball')!
    expect(screw.studyFirstSlug).toBe('circle-change')
  })
})
