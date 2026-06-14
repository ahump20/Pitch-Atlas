import { describe, it, expect } from 'vitest'
import { INDEX_SCOPE } from './index-scope'
import { PITCHES } from '../data/pitches'
import { BASIC_REPERTOIRE, REPERTOIRE, REPERTOIRE_FAMILIES } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'

/*
  Gate: the index scope copy is derived from the data arrays, never typed-in
  numerals. If a pitch is filed or a record is added, the copy moves with it.
  The shelf count must equal the rows the IndexLedger plate shows (REPERTOIRE),
  so the lede and the plate beside it never contradict.
*/

describe('index scope copy', () => {
  it('derives every count from the real arrays', () => {
    expect(INDEX_SCOPE.repertoireRows).toBe(REPERTOIRE.length)
    expect(INDEX_SCOPE.familyCount).toBe(REPERTOIRE_FAMILIES.length)
    expect(INDEX_SCOPE.pitchFiles).toBe(PITCHES.length + BASIC_REPERTOIRE.length)
    expect(INDEX_SCOPE.lostPitchRecords).toBe(LOST_PITCHES.length)
  })

  it('leads with the same row count the ledger shows', () => {
    // IndexLedger renders `${REPERTOIRE.length} rows`; the lede must agree.
    expect(INDEX_SCOPE.repertoireRows).toBe(REPERTOIRE.length)
    expect(INDEX_SCOPE.shelfLabel).toBe(
      `${INDEX_SCOPE.repertoireRows} pitches across ${INDEX_SCOPE.familyCount} families`,
    )
  })

  it('names the lost-pitches wing as its own derived clause', () => {
    expect(INDEX_SCOPE.lostNote).toBe(`${INDEX_SCOPE.lostPitchRecords} lost-pitch records`)
  })

  it('counts are real and non-zero (no empty-array regression)', () => {
    expect(PITCHES.length).toBeGreaterThan(0)
    expect(BASIC_REPERTOIRE.length).toBeGreaterThan(0)
    expect(LOST_PITCHES.length).toBeGreaterThan(0)
    expect(REPERTOIRE_FAMILIES.length).toBeGreaterThan(0)
  })
})
