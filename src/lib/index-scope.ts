import { PITCHES } from '../data/pitches'
import { BASIC_REPERTOIRE } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'

/*
  The index's scope, computed from the data arrays — never typed-in numerals.
  Pitch files are the distinct destinations the index can open: the filed
  specimens (src/data/pitches) plus the basic repertoire files (catalog entries
  without a filed specimen). Lost-pitch records are the Negro Leagues wing.
  Note: this counts files, not index rows — two catalog rows (the sinker, the
  gyroball) cross-reference specimens already counted, so the row count of the
  rendered index can sit above the file count. This is scope copy, not a
  per-family counter (those were deliberately removed in efd4308).
*/

const pitchFiles = PITCHES.length + BASIC_REPERTOIRE.length
const lostPitchRecords = LOST_PITCHES.length
const indexedEntries = pitchFiles + lostPitchRecords

export const INDEX_SCOPE = {
  pitchFiles,
  lostPitchRecords,
  indexedEntries,
  /** e.g. "54 indexed entries" — the number is derived, never typed in. */
  headline: `${indexedEntries} indexed entries`,
  /** e.g. "39 pitch files + 15 lost-pitch records" — derived, never typed in. */
  breakdown: `${pitchFiles} pitch files + ${lostPitchRecords} lost-pitch records`,
} as const
