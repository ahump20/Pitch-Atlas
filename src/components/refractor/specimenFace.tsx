import type { ReactNode } from 'react'
import { CONFIDENCE_META, type ClaimConfidence, type PitchAtlasEntry } from '../../data/types'
import { ACCENT, FALLBACK_ACCENT } from './accents'
import { RefractorBall } from './RefractorBall'
import { GripFace } from './GripFace'
import { GripClip } from './GripClip'
import { BallStage } from '../ball/BallStage'
import { gripEntryFor } from '../../data/grips'

/*
  How a filed pitch becomes a card face — one resolver, every card surface.

  This used to live inside PitchSpecimenCard while the home wall carried a
  hand-copied version that always passed the seam ball and always printed
  "Reference schematic". The result: the two pitches Austin actually filmed —
  the four-seam and the 12-6 — showed a drawn schematic on the front door while
  their real video sat in /public/grips doing nothing. Same failure shape as the
  binder tab that carried three of five families. One resolver, so a pitch wears
  the same face everywhere and a new clip reaches every surface at once.

  The ladder, richest real evidence first:
    1. a looping clip   — the four game-day pitches Austin filmed
    2. his still photo  — the situational grips he shot but didn't film
    3. the grip model   — the filed 3D specimen: real leather, the solved seam,
                          and the hand laid on its filed finger contacts. Costs a
                          WebGL context, so `model` gates it to the showcase
                          surfaces (home wall, hero) and everything else keeps the
                          cheap drawing.
    4. the seam drawing — flat, and the only face a pitch with no filed grip model
                          can honestly wear.

  The reference faces are never decoration standing in for missing media; they are
  the honest face for a pitch Austin doesn't throw, and the chip says which it is.
*/

/* Ink density per tier. The badge prints on the cream STATS plate, so the bright
   void dots would fail contrast — these are the paper-safe densities. Labels are
   never local: every badge reads its wording from CONFIDENCE_META, the one
   canonical seven-tier model. */
export const CARD_INK: Record<ClaimConfidence, string> = {
  'official-data': '#1E7A4A',
  'reputable-analysis': '#8A6118',
  'pitcher-own-words': '#2C5A8C',
  'coach-observed': '#2C5A8C',
  'secondhand-attributed': '#6E5E3A',
  'community-firsthand': '#6E5E3A',
  unverified: '#6E675A',
}

export interface SpecimenFace {
  face: ReactNode
  faceSource: { label: string; color: string }
  cue: string
  confidence: { label: string; color: string; approx?: boolean }
  /** True when the pitch carries a filed grip model — the gate for offering 3D. */
  modelled: boolean
}

export function specimenFace(
  entry: PitchAtlasEntry,
  {
    priority = false,
    idPrefix = '',
    model = false,
  }: {
    /** Hero-of-the-page face: paint its poster eagerly for a fast LCP. */
    priority?: boolean
    /** Namespaces the seam ball's gradient ids so two cards for one pitch can co-exist. */
    idPrefix?: string
    /** Showcase surface: mount the live 3D grip model instead of the flat drawing. */
    model?: boolean
  } = {},
): SpecimenFace {
  const { canonical, motion, display } = entry
  const accent = ACCENT[display.slug] ?? FALLBACK_ACCENT

  const grip = gripEntryFor(display.slug)
  const clip = grip?.clip
  const photo = grip && grip.photos.length > 0 ? grip.photos[0] : undefined
  const austinGrip = Boolean(clip || photo)

  const referenceGripClaim = canonical.gripDetails[0] ?? canonical.grip
  const cue = austinGrip && grip ? grip.shortCue : referenceGripClaim.value
  const cueConfidence = austinGrip && grip ? grip.claimTier : referenceGripClaim.confidence

  const modelled = canonical.gripModel.status === 'filed'
  const modelFace = model && modelled

  const faceSource = clip
    ? { label: 'Austin video', color: '#7FC6FF' }
    : photo
      ? { label: 'Austin photo', color: '#7FC6FF' }
      : modelFace
        ? { label: 'Reference grip model', color: '#CDBA8E' }
        : { label: 'Reference schematic', color: '#CDBA8E' }

  const face = clip ? (
    <GripClip clip={clip} priority={priority} />
  ) : photo ? (
    <GripFace photo={photo} priority={priority} />
  ) : modelFace ? (
    /* The real specimen, turning: leather, the solved seam, and the hand seated on
       this pitch's filed contacts. Not draggable here — the card is a link, and a
       drag released on it would navigate. The Grip Lab on the specimen page is
       where the ball is handled. Falls back to the same 2D seam drawing on
       no-WebGL, so the window is never empty. */
    <figure className="rfx-grip">
      <BallStage
        entry={entry}
        grip
        faceGrip
        surface="stage"
        interactive={false}
        /* every card presents the hold the same way. A pitch's own default view
           is tuned for the Grip Lab, where the ball is big enough to read a
           thumb-side or edge-on angle; in a 300px window those angles hide the
           fingers behind the ball. */
        view="side"
        /* the card window is only 10:9 — the Grip Lab's framing would run the
           hand off the top edge, so the camera sits back far enough to hold all
           of it, palm included */
        distance={7.4}
        className="h-full w-full"
      />
    </figure>
  ) : (
    <RefractorBall
      spinAxis={motion.spinAxis}
      gyro={motion.gyro}
      accent={accent}
      id={`${idPrefix}${display.slug}`}
      gripPoints={canonical.fingerPlacement}
    />
  )

  return {
    face,
    faceSource,
    cue,
    confidence: {
      label: CONFIDENCE_META[cueConfidence].label,
      color: CARD_INK[cueConfidence],
      approx: austinGrip ? false : referenceGripClaim.approximate,
    },
    modelled,
  }
}
