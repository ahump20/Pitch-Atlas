import type { PitchAtlasEntry } from '../types'
import { fourSeam } from './four-seam'
import { twoSeam } from './two-seam-fastball'
import { circleChange } from './circle-changeup'
import { twelveSix } from './twelve-six-curveball'
import { slider } from './slider'
import { splitter } from './splitter'
import { splinker } from './splinker'
import { sweeper } from './sweeper'

/*
  The atlas index. Order is the documented build order: four-seam first, then the
  pitches that contrast with it, then the two newest hybrids. The switcher and the
  routing read this list, so adding a specimen is one import and one array entry.
*/
export const PITCHES: PitchAtlasEntry[] = [
  fourSeam,
  twoSeam,
  circleChange,
  twelveSix,
  slider,
  splitter,
  splinker,
  sweeper,
]

const BY_SLUG: Record<string, PitchAtlasEntry> = Object.fromEntries(
  PITCHES.map((p) => [p.display.slug, p]),
)

export function pitchBySlug(slug: string): PitchAtlasEntry | undefined {
  return BY_SLUG[slug]
}
