import { PITCHES } from '../data/pitches'
import { BASIC_REPERTOIRE, REPERTOIRE, REPERTOIRE_FAMILIES } from '../data/repertoire'
import { LOST_PITCHES } from '../data/lost-pitches'

/*
  The index's scope, computed from the data arrays — never typed-in numerals.

  The shelf a visitor actually sees is REPERTOIRE: one catalog row per pitch,
  filed specimens and basic files together, grouped into families. The
  IndexLedger plate beside the lede counts those same REPERTOIRE rows ("40
  rows"), so the lede leads with that count and the two agree in one viewport.

  The lost-pitches wing (the Negro Leagues records) is a separate destination,
  counted on its own and named in its own clause — so the shelf total and the
  wing total never read as a single summed number. pitchFiles stays available
  for any caller that needs the distinct-file count, but it is not the headline.
*/

const repertoireRows = REPERTOIRE.length
const familyCount = REPERTOIRE_FAMILIES.length
const pitchFiles = PITCHES.length + BASIC_REPERTOIRE.length
const lostPitchRecords = LOST_PITCHES.length

export const INDEX_SCOPE = {
  repertoireRows,
  familyCount,
  pitchFiles,
  lostPitchRecords,
  /** Primary lede — matches the ledger's "{n} rows". Derived, never typed in. */
  shelfLabel: `${repertoireRows} pitches across ${familyCount} families`,
  /** The lost-pitches wing, named as its own destination. Derived. */
  lostNote: `${lostPitchRecords} lost-pitch records`,
} as const
