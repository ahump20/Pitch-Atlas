import type { Claim, PitchAtlasEntry } from '../data/types'

/*
  Honest per-pitch counts, computed from the data — never hardcoded. The source
  count is the number of distinct sources actually cited across a pitch's
  canonical claims and its master variants. If a figure carries no source (a
  weak 'unverified' claim), it adds nothing to the count.
*/

function collect(claim: Claim<string> | undefined, set: Set<string>) {
  if (claim && claim.source) set.add(claim.source.id)
}

/** Distinct cited sources across a pitch's canonical record and master files. */
export function countSources(entry: PitchAtlasEntry): number {
  const set = new Set<string>()
  const c = entry.canonical
  collect(c.grip, set)
  c.gripDetails.forEach((d) => collect(d, set))
  collect(c.mechanics, set)
  collect(c.physics.spinAxis, set)
  collect(c.physics.spinRateRpm, set)
  collect(c.physics.activeSpinPct, set)
  collect(c.physics.primaryBreak.claim, set)
  collect(c.physics.secondaryBreak?.claim, set)
  collect(c.physics.teaching, set)
  collect(c.voice, set)
  entry.masterVariants.forEach((m) => {
    m.numbers.forEach((n) => collect(n.claim, set))
    collect(m.quote, set)
  })
  return set.size
}
