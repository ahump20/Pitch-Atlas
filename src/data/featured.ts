import { PITCHES } from './pitches'
import type { PitchFamily } from './types'

const FEATURED_FAMILIES: PitchFamily[] = ['fastball', 'breaking', 'offspeed']

/** One real filed specimen per core family, in the same stable order everywhere. */
export function featuredPitchSet() {
  return FEATURED_FAMILIES.flatMap((family) => {
    const entry = PITCHES.find((pitch) => pitch.canonical.family === family)
    return entry ? [entry] : []
  })
}
