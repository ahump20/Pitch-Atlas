import type { PitchAtlasEntry } from '../../data/types'
import { RefractorCard } from './RefractorCard'
import { ACCENT, FALLBACK_ACCENT } from './accents'
import { specimenFace, type ClipPresentation } from './specimenFace'

/*
  One filed pitch, struck as a holographic specimen card. Used by the home hero
  (one, hero-scaled), the home filed set, and anywhere else a showcase card
  appears, so a pitch wears the same face everywhere. What goes in the window is
  decided by `specimenFace` — the one resolver both this card and the home wall
  read — so a real clip or photo can never be shadowed by the schematic. Foil is
  decoration; every reading is sourced from the pitch record.
*/
export function PitchSpecimenCard({
  entry,
  index = 0,
  maxWidth,
  foil = false,
  priority = false,
  clipPresentation,
  className,
}: {
  entry: PitchAtlasEntry
  index?: number
  /** Override the card's max width (e.g. a larger hero card). Defaults to 360. */
  maxWidth?: number
  /** Mount the live WebGL foil (the hero card only). */
  foil?: boolean
  /** Hero-of-the-page card: load its grip face eagerly for a fast LCP. */
  priority?: boolean
  /** Route-specific timing/framing for the same real clip used in the grip file. */
  clipPresentation?: ClipPresentation
  /** Material treatment hook; the content contract stays shared. */
  className?: string
}) {
  const { display } = entry
  const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT
  const gold = display.specimenNo === '00'
  const resolvedFace = specimenFace(entry, { priority, clipPresentation })

  return (
    <RefractorCard
      to={`/pitch/${display.slug}`}
      index={index}
      gold={gold}
      accent={accent}
      maxWidth={maxWidth}
      vnum={display.specimenNo}
      name={display.shortName}
      face={resolvedFace.face}
      faceSource={resolvedFace.faceSource}
      cue={resolvedFace.cue}
      confidence={resolvedFace.confidence}
      foil={foil}
      className={className}
    />
  )
}
