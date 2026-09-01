import type { PitchAtlasEntry } from '../../data/types'
import { RefractorCard } from './RefractorCard'
import { ACCENT, FALLBACK_ACCENT } from './accents'
import { specimenFace } from './specimenFace'

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
  presentationFace,
}: {
  entry: PitchAtlasEntry
  index?: number
  /** Override the card's max width (e.g. a larger hero card). Defaults to 360. */
  maxWidth?: number
  /** Mount the live WebGL foil (the hero card only). */
  foil?: boolean
  /** Hero-of-the-page card: load its grip face eagerly for a fast LCP. */
  priority?: boolean
  /**
   * Route-specific, presentation-only crop. This never replaces the filed grip
   * media used by the specimen page or Grip Library.
   */
  presentationFace?: { src: string; alt: string }
}) {
  const { display } = entry
  const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT
  const gold = display.specimenNo === '00'
  const resolvedFace = specimenFace(entry, { priority })
  const face = presentationFace ? (
    <figure className="rfx-grip">
      <img
        className="rfx-grip-img media-fade is-loaded"
        src={presentationFace.src}
        alt={presentationFace.alt}
        width={900}
        height={900}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </figure>
  ) : resolvedFace.face
  const faceSource = presentationFace
    ? { label: 'Austin photo', color: '#7FC6FF' }
    : resolvedFace.faceSource

  return (
    <RefractorCard
      to={`/pitch/${display.slug}`}
      index={index}
      gold={gold}
      accent={accent}
      maxWidth={maxWidth}
      vnum={display.specimenNo}
      name={display.shortName}
      face={face}
      faceSource={faceSource}
      cue={resolvedFace.cue}
      confidence={resolvedFace.confidence}
      foil={foil}
    />
  )
}
