import { describe, it, expect } from 'vitest'
import { INDEX_SCOPE } from './index-scope'
import { PITCHES } from '../data/pitches'
import { BASIC_REPERTOIRE } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'

/*
  Gate: the index scope copy is derived from the data arrays, never typed-in
  numerals. If a pitch is filed or a record is added, the copy moves with it.
*/

describe('index scope copy', () => {
  it('derives every count from the real arrays', () => {
    expect(INDEX_SCOPE.pitchFiles).toBe(PITCHES.length + BASIC_REPERTOIRE.length)
    expect(INDEX_SCOPE.lostPitchRecords).toBe(LOST_PITCHES.length)
    expect(INDEX_SCOPE.indexedEntries).toBe(INDEX_SCOPE.pitchFiles + INDEX_SCOPE.lostPitchRecords)
  })

  it('renders the copy templates from the derived numbers', () => {
    expect(INDEX_SCOPE.headline).toBe(`${INDEX_SCOPE.indexedEntries} indexed entries`)
    expect(INDEX_SCOPE.breakdown).toBe(
      `${INDEX_SCOPE.pitchFiles} pitch files + ${INDEX_SCOPE.lostPitchRecords} lost-pitch records`,
    )
  })

  it('counts are real and non-zero (no empty-array regression)', () => {
    expect(PITCHES.length).toBeGreaterThan(0)
    expect(BASIC_REPERTOIRE.length).toBeGreaterThan(0)
    expect(LOST_PITCHES.length).toBeGreaterThan(0)
  })
})
