import type { PitchAtlasEntry } from './types'
import { gripEntryFor } from './grips'

/*
  The honest specimen grade: how richly THIS atlas has preserved a filed pitch,
  read straight off data already on the page. It is a pure switch — never a
  random draw, never a number a visitor can't trace, never a "limited print"
  scarcity claim. A grade reflects documentation depth (a first-party moving grip
  beats a still beats a reference schematic), which is the same provenance
  discipline every other claim on the site holds. The gold 1/1 keeps its existing
  meaning: the four-seam struck at specimen 00, the bread-and-butter chase — a
  real edition of one, never a manufactured print run.

  Read by the specimen cards (PitchSpecimenCard, the chrome wall) so a pitch wears
  the same grade everywhere it appears. This is the "how well preserved" axis;
  field rarity (how rare the pitch is in the game) is a separate axis carried by
  RepertoireStatus on the index, and the two are never folded into one score.
*/
export type SpecimenGradeKey = 'gold' | 'in-motion' | 'first-party' | 'reference'

export interface SpecimenGrade {
  key: SpecimenGradeKey
  /** The visible stamp wording. Categorical; the only digits are the real 1/1 gold. */
  label: string
}

const LABEL: Record<SpecimenGradeKey, string> = {
  gold: 'Gold · 1 of 1',
  'in-motion': 'First-party motion',
  'first-party': 'First-party grip',
  reference: 'Reference specimen',
}

export function specimenGradeFor(entry: PitchAtlasEntry): SpecimenGrade {
  const key = gradeKey(entry)
  return { key, label: LABEL[key] }
}

function gradeKey(entry: PitchAtlasEntry): SpecimenGradeKey {
  // 1) the singular chase — the four-seam struck at specimen 00.
  if (entry.display.specimenNo === '00') return 'gold'

  // The same grip lookup the card face uses, so a grade never contradicts the
  // artifact a visitor is actually looking at.
  const grip = gripEntryFor(entry.display.slug)

  // 2) the pitcher's own grip, filmed — the richest preservation a card can carry.
  if (grip?.clip) return 'in-motion'

  // 3) the pitcher's own grip on file as a still, or an owned render on the record.
  if ((grip?.photos.length ?? 0) > 0 || (entry.canonical.gripImages?.length ?? 0) > 0) {
    return 'first-party'
  }

  // 4) filed and authored, but with no first-party image — an honest reference specimen.
  return 'reference'
}
