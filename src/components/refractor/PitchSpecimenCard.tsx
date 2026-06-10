import type { PitchAtlasEntry, ClaimConfidence } from '../../data/types'
import { CONFIDENCE_META } from '../../data/types'
import { RefractorCard } from './RefractorCard'
import { ACCENT, FALLBACK_ACCENT } from './accents'
import { RefractorBall } from './RefractorBall'
import { GripFace } from './GripFace'
import { GripClip } from './GripClip'
import { familyCrumb } from './familyCrumb'
import { gripEntryFor } from '../../data/grips'

/*
  One filed pitch, struck as a holographic specimen card. The single source of "how a
  pitch becomes a card" — used by the home hero (one, hero-scaled), the home Pitch Index
  set, and anywhere else a showcase card appears, so a pitch wears the same face
  everywhere. The window shows the grip itself: a looping clip for the four game-day
  pitches Austin throws, his still photo for the situational ones, else the seam ball
  with the pitch's real finger-placement pins (and "Reference grip"). Circle change has
  neither, so it stays the schematic and never implies he throws it. Foil is decoration;
  every reading is sourced from the pitch record.
*/

/* Card-palette color per tier. Labels are never local: every badge on the card
   reads its wording from CONFIDENCE_META, the one canonical seven-tier model. */
const CONF_COLOR: Record<ClaimConfidence, string> = {
  'official-data': 'var(--color-ok-bright)',
  'reputable-analysis': 'var(--color-amber-bright)',
  'pitcher-own-words': 'var(--color-powder)',
  'coach-observed': 'var(--color-powder)',
  'secondhand-attributed': 'var(--color-sand-bright)',
  'community-firsthand': 'var(--color-sand-bright)',
  unverified: 'var(--color-ink-3)',
}

export function PitchSpecimenCard({
  entry,
  index = 0,
  maxWidth,
  foil = false,
}: {
  entry: PitchAtlasEntry
  index?: number
  /** Override the card's max width (e.g. a larger hero card). Defaults to 360. */
  maxWidth?: number
  /** Mount the live WebGL foil (the hero card only). */
  foil?: boolean
}) {
  const { canonical, motion, display } = entry
  const physics = canonical.physics
  const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT
  const gold = display.specimenNo === '00'
  const shapeClaim = physics.shape
  const conf = {
    label: CONFIDENCE_META[shapeClaim.confidence].label,
    color: CONF_COLOR[shapeClaim.confidence],
  }

  const grip = gripEntryFor(display.slug)
  const clip = grip?.clip
  const photo = grip && grip.photos.length > 0 ? grip.photos[0] : undefined
  const austinGrip = Boolean(clip || photo)
  const cue = austinGrip && grip ? grip.shortCue : display.heroSub
  const gripSource = austinGrip
    ? { label: "Austin's grip", color: 'var(--color-powder)' }
    : { label: 'Reference grip', color: 'var(--color-ink-3)' }

  const face = clip ? (
    <GripClip clip={clip} />
  ) : photo ? (
    <GripFace photo={photo} />
  ) : (
    <RefractorBall
      spinAxis={motion.spinAxis}
      gyro={motion.gyro}
      accent={accent}
      id={display.slug}
      gripPoints={canonical.fingerPlacement}
    />
  )

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
      shape={shapeClaim.value}
      cue={cue}
      confidence={{ label: conf.label, color: conf.color, approx: shapeClaim.approximate }}
      crumb={familyCrumb(canonical.family)}
      gripSource={gripSource}
      foil={foil}
    />
  )
}
