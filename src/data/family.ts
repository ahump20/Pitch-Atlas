import type { PitchAtlasEntry, PitchFamily } from './types'

/*
  A pitch's family, named the way the Pitch Index filters it. One place, so the pitch
  page's pill, the back of the card, its export and the inspector's header can never
  name a family two ways.
*/
export const FAMILY_LABEL: Record<PitchFamily, string> = {
  fastball: 'Fastball',
  breaking: 'Breaking',
  offspeed: 'Offspeed',
}

export function familyLabel(family: PitchFamily): string {
  return FAMILY_LABEL[family]
}

/** The line over a pitch's full name: its family, unless the name already says it
    ("Four-seam fastball" needs no "Fastball" over it). */
export function familyOverline(entry: PitchAtlasEntry): string | null {
  const label = familyLabel(entry.canonical.family)
  return entry.canonical.name.toLowerCase().includes(label.toLowerCase()) ? null : label
}
