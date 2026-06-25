import type { PitchAtlasEntry } from '../types'
import { fourSeam } from './four-seam'
import { twoSeam } from './two-seam-fastball'
import { circleChange } from './circle-changeup'
import { twelveSix } from './twelve-six-curveball'
import { slider } from './slider'
import { splitter } from './splitter'
import { splinker } from './splinker'
import { sweeper } from './sweeper'
import { knuckleball } from './knuckleball'
import { cutter } from './cutter'
import { forkball } from './forkball'
import { eephus } from './eephus'

/*
  The atlas index, and the reading order. Austin's own pitches lead — the four-seam,
  two-seam, and 12-6 he actually threw and has grip data on (the four-seam stays at
  [0] as the homepage hero, his self-described bread and butter). Then the
  fundamentals every arsenal is built from, and the rarer/specialty pitches last —
  the eephus and the near-extinct arms bring up the rear, never the front. The
  switcher and the routing read this list, so adding a specimen is one import and one
  array entry.
*/
export const PITCHES: PitchAtlasEntry[] = [
  fourSeam,
  twoSeam,
  twelveSix,
  circleChange,
  splitter,
  cutter,
  slider,
  sweeper,
  splinker,
  forkball,
  knuckleball,
  eephus,
]

const BY_SLUG: Record<string, PitchAtlasEntry> = Object.fromEntries(
  PITCHES.map((p) => [p.display.slug, p]),
)

export function pitchBySlug(slug: string): PitchAtlasEntry | undefined {
  return BY_SLUG[slug]
}
